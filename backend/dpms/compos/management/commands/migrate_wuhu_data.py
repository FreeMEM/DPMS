"""
Management command to migrate data from WUHU (PHP/MySQL) to DPMS (Django/PostgreSQL).

Migrates:
- Users (71) with profiles
- Compos (16)
- Productions (45)
- Votes (1098)
- Votekeys (300) as AttendanceCodes

Usage:
    python manage.py migrate_wuhu_data [options]

Options:
    --sql-file PATH         Path to WUHU SQL dump
    --productions-dir PATH  Path to WUHU productions directory
    --clear                 Clear existing data before migration
    --dry-run              Show what would be done without executing
    --skip-files           Don't copy physical files
    --skip-votes           Don't migrate votes
"""

import os
import re
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from dpms.compos.models import (
    Edition,
    Compo,
    HasCompo,
    Production,
    File,
    VotingConfiguration,
    VotingPeriod,
    AttendanceCode,
    Vote,
)
from dpms.users.models.profiles import Profile

User = get_user_model()


class WuhuSQLParser:
    """Parse WUHU MySQL dump file and extract data."""

    def __init__(self, sql_content):
        self.sql_content = sql_content
        self.users = []
        self.compos = []
        self.compoentries = []
        self.votes = []
        self.votekeys = []
        self.settings = {}

    def parse(self):
        """Parse all tables from SQL dump."""
        self.users = self._parse_insert_values('users')
        self.compos = self._parse_insert_values('compos')
        self.compoentries = self._parse_insert_values('compoentries')
        self.votes = self._parse_insert_values('votes_range')
        self.votekeys = self._parse_insert_values('votekeys')
        self.settings = self._parse_settings()
        return self

    def _parse_insert_values(self, table_name):
        """Extract INSERT VALUES from a table."""
        # Pattern to match INSERT INTO `table` VALUES (...)
        pattern = rf"INSERT INTO `{table_name}` VALUES\s*(.+?);\s*$"
        match = re.search(pattern, self.sql_content, re.DOTALL | re.MULTILINE)
        if not match:
            return []

        values_str = match.group(1)
        return self._parse_values(values_str)

    def _parse_values(self, values_str):
        """Parse VALUES (...),(...) into list of tuples using state machine."""
        results = []
        current_row = []
        current_value = ''
        in_string = False
        paren_depth = 0

        i = 0
        length = len(values_str)

        while i < length:
            char = values_str[i]

            if in_string:
                if char == '\\' and i + 1 < length:
                    # Handle escape sequences - include both chars
                    current_value += char + values_str[i + 1]
                    i += 2
                    continue
                elif char == "'":
                    # Check for escaped quote '' (MySQL style)
                    if i + 1 < length and values_str[i + 1] == "'":
                        current_value += "''"
                        i += 2
                        continue
                    else:
                        # End of string
                        in_string = False
                        current_value += char
                else:
                    current_value += char
            else:
                if char == "'":
                    in_string = True
                    current_value += char
                elif char == '(':
                    if paren_depth == 0:
                        # Start of new row
                        current_value = ''
                        current_row = []
                    else:
                        current_value += char
                    paren_depth += 1
                elif char == ')':
                    paren_depth -= 1
                    if paren_depth == 0:
                        # End of row
                        if current_value.strip():
                            current_row.append(self._clean_value(current_value))
                        if current_row:
                            results.append(tuple(current_row))
                        current_row = []
                        current_value = ''
                    else:
                        current_value += char
                elif char == ',' and paren_depth == 1:
                    # Field separator within row
                    current_row.append(self._clean_value(current_value))
                    current_value = ''
                elif char in ' \t\n\r' and not current_value.strip():
                    # Skip leading whitespace
                    pass
                else:
                    current_value += char

            i += 1

        return results

    def _clean_value(self, value):
        """Clean a SQL value and convert to Python type."""
        value = value.strip()

        if not value or value.upper() == 'NULL':
            return None

        if value.startswith("'") and value.endswith("'"):
            # Remove quotes and unescape
            value = value[1:-1]
            # MySQL escape sequences
            value = value.replace("\\'", "'")
            value = value.replace("''", "'")  # MySQL style escaped quote
            value = value.replace("\\n", "\n")
            value = value.replace("\\r", "\r")
            value = value.replace("\\t", "\t")
            value = value.replace("\\\\", "\\")
            return value

        # Try to parse as number
        try:
            return int(value)
        except ValueError:
            try:
                return float(value)
            except ValueError:
                return value

    def _parse_settings(self):
        """Parse settings table into dictionary."""
        settings_data = self._parse_insert_values('settings')
        result = {}
        for row in settings_data:
            if len(row) >= 3:
                # (id, setting, value)
                result[row[1]] = row[2]
        return result


class Command(BaseCommand):
    help = 'Migrate data from WUHU (PHP/MySQL) to DPMS (Django/PostgreSQL)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sql-file',
            type=str,
            default=os.path.expanduser('~/Projects/wuhu-posadas/wuhu_25012026.sql'),
            help='Path to WUHU SQL dump file'
        )
        parser.add_argument(
            '--productions-dir',
            type=str,
            default=os.path.expanduser('~/Projects/wuhu-posadas/www/posadas_productions/'),
            help='Path to WUHU productions directory'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before migration'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be done without executing'
        )
        parser.add_argument(
            '--skip-files',
            action='store_true',
            help='Don\'t copy physical files'
        )
        parser.add_argument(
            '--skip-votes',
            action='store_true',
            help='Don\'t migrate votes'
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        self.skip_files = options['skip_files']
        self.skip_votes = options['skip_votes']
        self.verbosity = options['verbosity']

        sql_file = options['sql_file']
        productions_dir = options['productions_dir']

        # Validate paths
        if not os.path.exists(sql_file):
            raise CommandError(f"SQL file not found: {sql_file}")

        if not os.path.exists(productions_dir):
            raise CommandError(f"Productions directory not found: {productions_dir}")

        self.productions_dir = Path(productions_dir)
        self.entries_dir = self.productions_dir / 'entries_private'
        self.screenshots_dir = self.productions_dir / 'screenshots'

        # Parse SQL dump
        self.stdout.write(self.style.NOTICE(f"Parsing SQL dump: {sql_file}"))
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        parser = WuhuSQLParser(sql_content)
        parser.parse()

        self.wuhu = parser
        self.stdout.write(f"  Users: {len(parser.users)}")
        self.stdout.write(f"  Compos: {len(parser.compos)}")
        self.stdout.write(f"  Productions: {len(parser.compoentries)}")
        self.stdout.write(f"  Votes: {len(parser.votes)}")
        self.stdout.write(f"  Votekeys: {len(parser.votekeys)}")

        if self.dry_run:
            self.stdout.write(self.style.WARNING("\n=== DRY RUN MODE ===\n"))

        try:
            with transaction.atomic():
                # Get or create admin user
                self.admin_user = self._get_admin_user()

                if options['clear']:
                    self._clear_data()

                # Migration steps
                self.edition = self._create_edition()
                self.compo_map = self._migrate_compos()
                self.user_map = self._migrate_users()
                self.production_map = self._migrate_productions()

                if not self.skip_votes:
                    self._migrate_votes()

                self._migrate_votekeys()
                self._create_voting_config()

                if self.dry_run:
                    raise DryRunRollback()

        except DryRunRollback:
            self.stdout.write(self.style.SUCCESS("\nDry run completed - no changes made"))
            return

        self.stdout.write(self.style.SUCCESS("\nMigration completed successfully!"))
        self._print_summary()

    def _get_admin_user(self):
        """Get or create admin user for ownership."""
        admin = User.objects.filter(is_superuser=True).first()
        if not admin:
            if self.dry_run:
                self.stdout.write("  Would create admin user: admin@dpms.local")
                return None
            admin = User.objects.create_superuser(
                email='admin@dpms.local',
                username='admin',
                password='admin123',
                is_verified=True,
            )
            self.stdout.write(self.style.WARNING("Created admin user: admin@dpms.local"))
        return admin

    def _clear_data(self):
        """Clear existing migrated data."""
        self.stdout.write(self.style.WARNING("\nClearing existing data..."))

        if self.dry_run:
            self.stdout.write("  Would delete all Productions, Files, Votes, etc.")
            return

        # Delete in order of dependencies
        Vote.objects.all().delete()
        AttendanceCode.objects.all().delete()
        VotingPeriod.objects.all().delete()
        VotingConfiguration.objects.all().delete()
        File.objects.all().delete()
        Production.objects.all().delete()
        HasCompo.objects.all().delete()
        Edition.objects.filter(title__contains="Posadas").delete()

        self.stdout.write("  Cleared existing data")

    def _create_edition(self):
        """Create the Posadas Party 2025 edition."""
        self.stdout.write(self.style.NOTICE("\nCreating Edition..."))

        party_name = self.wuhu.settings.get('party_name', 'Posadas Party 2025')
        party_date = self.wuhu.settings.get('party_firstday', '2025-06-27')

        if self.dry_run:
            self.stdout.write(f"  Would create edition: {party_name}")
            return None

        edition, created = Edition.objects.get_or_create(
            title=party_name,
            defaults={
                'description': f"Imported from WUHU - {party_date}",
                'uploaded_by': self.admin_user,
                'public': True,
                'open_to_upload': False,
                'open_to_update': False,
                'productions_public': True,
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"  Created: {edition.title}"))
        else:
            self.stdout.write(f"  Using existing: {edition.title}")

        return edition

    def _migrate_compos(self):
        """Migrate compos from WUHU."""
        self.stdout.write(self.style.NOTICE("\nMigrating Compos..."))

        compo_map = {}  # wuhu_id -> dpms_compo

        for row in self.wuhu.compos:
            # (id, name, start, showauthor, votingopen, uploadopen, updateopen, dirname)
            wuhu_id = row[0]
            name = row[1]
            start = row[2]
            show_author = row[3] == 1
            dirname = row[7]

            # Parse start datetime
            if isinstance(start, str):
                try:
                    start_dt = datetime.strptime(start, '%Y-%m-%d %H:%M:%S')
                    start_dt = timezone.make_aware(start_dt)
                except ValueError:
                    start_dt = timezone.now()
            else:
                start_dt = timezone.now()

            if self.dry_run:
                self.stdout.write(f"  Would create compo: {name} (id={wuhu_id})")
                compo_map[wuhu_id] = {'name': name, 'dirname': dirname}
                continue

            # Create or get Compo
            compo, created = Compo.objects.get_or_create(
                name=name,
                defaults={
                    'description': f"Imported from WUHU (dirname: {dirname})",
                    'created_by': self.admin_user,
                }
            )

            # Create HasCompo to link to edition
            has_compo, hc_created = HasCompo.objects.get_or_create(
                edition=self.edition,
                compo=compo,
                defaults={
                    'start': start_dt,
                    'show_authors_on_slide': show_author,
                    'open_to_upload': False,
                    'open_to_update': False,
                    'created_by': self.admin_user,
                }
            )

            compo_map[wuhu_id] = compo
            status = "created" if created else "existing"
            self.stdout.write(f"  {status}: {name}")

        return compo_map

    def _migrate_users(self):
        """Migrate users from WUHU."""
        self.stdout.write(self.style.NOTICE("\nMigrating Users..."))

        user_map = {}  # wuhu_id -> dpms_user
        user_map[0] = self.admin_user  # Map userid=0 to admin

        for row in self.wuhu.users:
            # (id, username, password, nickname, group, regtime, regip, visible)
            wuhu_id = row[0]
            username = row[1]
            nickname = row[3] or username
            group = row[4] or ''
            regtime = row[5]
            visible = row[7] == 1

            # Create email from username
            email = f"{username.lower()}@wuhu.posadas.local"

            # Parse regtime
            if isinstance(regtime, str):
                try:
                    created_dt = datetime.strptime(regtime, '%Y-%m-%d %H:%M:%S')
                    created_dt = timezone.make_aware(created_dt)
                except ValueError:
                    created_dt = timezone.now()
            else:
                created_dt = timezone.now()

            if self.dry_run:
                self.stdout.write(f"  Would create user: {email} ({nickname})")
                user_map[wuhu_id] = {'email': email, 'nickname': nickname}
                continue

            # First try to find user by email
            user = User.objects.filter(email=email).first()
            created = False

            if not user:
                # Check if username already exists (conflict)
                if User.objects.filter(username=username).exists():
                    # Generate unique username with wuhu suffix
                    unique_username = f"{username}_wuhu{wuhu_id}"
                else:
                    unique_username = username

                # Create new user
                user = User.objects.create(
                    email=email,
                    username=unique_username,
                    is_verified=False,  # Force password reset
                    is_active=True,
                )
                # Set temporary password
                user.set_password('posadas2025')
                user.save()

                # Update created timestamp
                User.objects.filter(pk=user.pk).update(created=created_dt)
                created = True

            # Create or update Profile
            profile, _ = Profile.objects.get_or_create(
                user=user,
                defaults={
                    'nickname': nickname,
                    'group': group,
                    'visit_listing': visible,
                }
            )

            if not created:
                # Update existing profile
                profile.nickname = nickname
                profile.group = group
                profile.visit_listing = visible
                profile.save()

            user_map[wuhu_id] = user
            status = "created" if created else "updated"
            self.stdout.write(f"  {status}: {email} ({nickname})")

        return user_map

    def _migrate_productions(self):
        """Migrate productions (compoentries) from WUHU."""
        self.stdout.write(self.style.NOTICE("\nMigrating Productions..."))

        production_map = {}  # wuhu_id -> dpms_production

        for row in self.wuhu.compoentries:
            # (id, compoid, userid, title, author, comment, orgacomment,
            #  playingorder, filename, uploadip, uploadtime, organotes, organizerfeedback)
            wuhu_id = row[0]
            compo_id = row[1]
            user_id = row[2]
            title = row[3]
            author = row[4]
            comment = row[5] or ''
            playingorder = row[7]
            filename = row[8]
            uploadtime = row[10]

            if self.dry_run:
                self.stdout.write(f"  Would create production: {title} by {author}")
                production_map[wuhu_id] = {
                    'title': title,
                    'compo_id': compo_id,
                    'playingorder': playingorder,
                }
                continue

            # Get compo and user
            compo = self.compo_map.get(compo_id)
            user = self.user_map.get(user_id, self.admin_user)

            if not compo:
                self.stdout.write(self.style.WARNING(
                    f"  Skipping: {title} - compo {compo_id} not found"
                ))
                continue

            # Parse uploadtime
            if isinstance(uploadtime, str):
                try:
                    upload_dt = datetime.strptime(uploadtime, '%Y-%m-%d %H:%M:%S')
                    upload_dt = timezone.make_aware(upload_dt)
                except ValueError:
                    upload_dt = timezone.now()
            else:
                upload_dt = timezone.now()

            # Create Production
            production = Production.objects.create(
                title=title,
                authors=author,
                description=comment,
                uploaded_by=user,
                edition=self.edition,
                compo=compo,
            )

            # Update created timestamp
            Production.objects.filter(pk=production.pk).update(created=upload_dt)

            # Copy files if not skipping
            if not self.skip_files:
                self._copy_production_files(production, compo_id, playingorder, filename)

            production_map[wuhu_id] = production
            self.stdout.write(f"  Created: {title} by {author}")

        return production_map

    def _copy_production_files(self, production, compo_id, playingorder, filename):
        """Copy production files from WUHU to DPMS."""
        # Find compo dirname from wuhu data
        compo_dirname = None
        for row in self.wuhu.compos:
            if row[0] == compo_id:
                compo_dirname = row[7]
                break

        if not compo_dirname:
            self.stdout.write(self.style.WARNING(
                f"    No dirname for compo {compo_id}"
            ))
            return

        # Source path: entries_private/<dirname>/<playingorder>/<filename>
        order_padded = str(playingorder).zfill(3)
        source_dir = self.entries_dir / compo_dirname / order_padded

        if not source_dir.exists():
            self.stdout.write(self.style.WARNING(
                f"    Source directory not found: {source_dir}"
            ))
            return

        # Find the file (might have different name than expected)
        source_files = list(source_dir.iterdir())
        if not source_files:
            self.stdout.write(self.style.WARNING(
                f"    No files in: {source_dir}"
            ))
            return

        for source_file in source_files:
            if source_file.is_file():
                self._create_file_record(production, source_file)

    def _create_file_record(self, production, source_path):
        """Create a File record and copy the physical file."""
        original_filename = source_path.name
        ext = source_path.suffix.lower()

        # Generate destination path
        edition_slug = slugify(production.edition.title)
        compo_slug = slugify(production.compo.name)
        unique_name = f"{slugify(source_path.stem)}_{uuid.uuid4().hex}{ext}"
        rel_path = f"files/{edition_slug}/{compo_slug}/{unique_name}"

        # Full destination path
        dest_path = Path(settings.MEDIA_ROOT) / rel_path

        # Create directories
        dest_path.parent.mkdir(parents=True, exist_ok=True)

        # Copy file
        shutil.copy2(source_path, dest_path)

        # Create File record
        file_record = File.objects.create(
            title=original_filename,
            description=f"Imported from WUHU - {production.title}",
            uploaded_by=production.uploaded_by,
            original_filename=original_filename,
            file=rel_path,
            public=True,
            is_active=True,
        )

        # Link to production
        production.files.add(file_record)

        self.stdout.write(f"    File: {original_filename}")

    def _migrate_votes(self):
        """Migrate votes from WUHU."""
        self.stdout.write(self.style.NOTICE("\nMigrating Votes..."))

        if self.dry_run:
            self.stdout.write(f"  Would migrate {len(self.wuhu.votes)} votes")
            return

        # Build entry order map for each compo
        # votes_range uses entryorderid which is playingorder
        entry_map = {}  # (compo_id, playingorder) -> production
        for row in self.wuhu.compoentries:
            wuhu_id = row[0]
            compo_id = row[1]
            playingorder = row[7]
            production = self.production_map.get(wuhu_id)
            if production:
                entry_map[(compo_id, playingorder)] = production

        votes_created = 0
        for row in self.wuhu.votes:
            # (id, compoid, userid, entryorderid, vote, votedate)
            compo_id = row[1]
            user_id = row[2]
            entry_order = row[3]
            vote_value = row[4]
            vote_date = row[5]

            # Find production
            production = entry_map.get((compo_id, entry_order))
            if not production:
                continue

            # Get user
            user = self.user_map.get(user_id, self.admin_user)
            if isinstance(user, dict):
                continue  # Dry run

            # Normalize vote (wuhu 0-10 -> dpms 1-10)
            score = max(1, min(10, vote_value))

            # Parse vote date
            if isinstance(vote_date, str):
                try:
                    vote_dt = datetime.strptime(vote_date, '%Y-%m-%d %H:%M:%S')
                    vote_dt = timezone.make_aware(vote_dt)
                except ValueError:
                    vote_dt = timezone.now()
            else:
                vote_dt = timezone.now()

            # Create vote (without validation - historical data)
            vote, created = Vote.objects.get_or_create(
                user=user,
                production=production,
                defaults={
                    'score': score,
                    'is_jury_vote': False,
                }
            )

            if created:
                # Update created timestamp
                Vote.objects.filter(pk=vote.pk).update(created=vote_dt)
                votes_created += 1

        self.stdout.write(f"  Created {votes_created} votes")

    def _migrate_votekeys(self):
        """Migrate votekeys as AttendanceCodes."""
        self.stdout.write(self.style.NOTICE("\nMigrating Votekeys as AttendanceCodes..."))

        if self.dry_run:
            self.stdout.write(f"  Would create {len(self.wuhu.votekeys)} attendance codes")
            return

        codes_created = 0
        for row in self.wuhu.votekeys:
            # (id, userid, votekey)
            user_id = row[1]
            votekey = row[2]

            # Get user if assigned
            user = self.user_map.get(user_id) if user_id > 0 else None
            if isinstance(user, dict):
                user = None

            # Create AttendanceCode
            code, created = AttendanceCode.objects.get_or_create(
                code=votekey,
                edition=self.edition,
                defaults={
                    'is_used': user is not None,
                    'used_by': user,
                    'used_at': timezone.now() if user else None,
                }
            )

            if created:
                codes_created += 1

        self.stdout.write(f"  Created {codes_created} attendance codes")

    def _create_voting_config(self):
        """Create VotingConfiguration for the edition."""
        self.stdout.write(self.style.NOTICE("\nCreating Voting Configuration..."))

        if self.dry_run:
            self.stdout.write("  Would create voting configuration")
            return

        config, created = VotingConfiguration.objects.get_or_create(
            edition=self.edition,
            defaults={
                'voting_mode': 'public',
                'public_weight': 100,
                'jury_weight': 0,
                'access_mode': 'code',
                'results_published': True,
                'results_published_at': timezone.now(),
            }
        )

        # Create a closed voting period
        voting_start = timezone.make_aware(datetime(2025, 6, 28, 10, 0, 0))
        voting_end = timezone.make_aware(datetime(2025, 6, 29, 10, 0, 0))

        VotingPeriod.objects.get_or_create(
            edition=self.edition,
            defaults={
                'start_date': voting_start,
                'end_date': voting_end,
                'is_active': False,  # Closed
            }
        )

        status = "created" if created else "exists"
        self.stdout.write(f"  Voting configuration {status}")

    def _print_summary(self):
        """Print migration summary."""
        self.stdout.write(self.style.NOTICE("\n=== Migration Summary ==="))

        if self.edition:
            self.stdout.write(f"Edition: {self.edition.title}")
            self.stdout.write(f"Compos: {len(self.compo_map)}")
            self.stdout.write(f"Users: {len(self.user_map)}")
            self.stdout.write(f"Productions: {len(self.production_map)}")

            # Count related data
            votes = Vote.objects.filter(production__edition=self.edition).count()
            codes = AttendanceCode.objects.filter(edition=self.edition).count()
            self.stdout.write(f"Votes: {votes}")
            self.stdout.write(f"Attendance Codes: {codes}")


class DryRunRollback(Exception):
    """Exception to trigger rollback in dry-run mode."""
    pass
