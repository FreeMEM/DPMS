"""
Management command to populate the database with demo data for Posadas Party 2025.
"""

import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model

from dpms.users.models import Profile
from dpms.compos.models import (
    Edition,
    Compo,
    HasCompo,
    Production,
    VotingConfiguration,
    JuryMember,
    Vote,
    VotingPeriod,
    AttendanceCode,
    AttendeeVerification,
)

User = get_user_model()


class Command(BaseCommand):
    help = "Populate database with demo data for Posadas Party July 2025"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing demo data before populating",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            self.clear_data()

        self.stdout.write("Creating demo data for Posadas Party 2025...")

        # Create admin user if not exists
        admin = self.create_admin()

        # Create users and profiles
        users = self.create_users()

        # Create compos
        compos = self.create_compos(admin)

        # Create edition
        edition = self.create_edition(admin)

        # Link compos to edition
        self.create_has_compos(edition, compos, admin)

        # Create productions
        productions = self.create_productions(edition, compos, users)

        # Create voting configuration
        voting_config = self.create_voting_config(edition)

        # Create jury members
        jury = self.create_jury(edition, compos, users)

        # Create voting period
        voting_period = self.create_voting_period(edition)

        # Create attendance codes and verifications
        self.create_attendance(edition, users)

        # Create votes
        self.create_votes(productions, users, jury)

        self.stdout.write(
            self.style.SUCCESS("Demo data created successfully!")
        )

    def clear_data(self):
        """Clear existing demo data"""
        Vote.objects.all().delete()
        AttendeeVerification.objects.all().delete()
        AttendanceCode.objects.all().delete()
        JuryMember.objects.all().delete()
        VotingPeriod.objects.all().delete()
        VotingConfiguration.objects.all().delete()
        Production.objects.all().delete()
        HasCompo.objects.all().delete()
        Edition.objects.all().delete()
        Compo.objects.all().delete()
        # Keep admin, delete demo users
        User.objects.filter(email__contains="@demo.party").delete()

    def create_admin(self):
        """Create or get admin user"""
        # Try to get existing admin
        admin = User.objects.filter(is_superuser=True).first()
        if admin:
            self.stdout.write(f"  Using existing admin: {admin.email}")
            # Ensure profile exists
            if not hasattr(admin, 'profile') or admin.profile is None:
                Profile.objects.get_or_create(
                    user=admin,
                    defaults={
                        "nickname": "FreeMEM",
                        "group": "Organizers",
                    },
                )
            return admin

        # Create new admin if none exists
        admin = User.objects.create_superuser(
            email="admin@posadasparty.com",
            username="admin",
            password="admin123",
        )
        admin.is_verified = True
        admin.save()
        Profile.objects.create(
            user=admin,
            nickname="FreeMEM",
            group="Organizers",
        )
        self.stdout.write(f"  Created admin: {admin.email}")
        return admin

    def create_users(self):
        """Create demo users with demoscene profiles"""
        users_data = [
            # Sceners - Spanish scene
            {"username": "baudelaire", "nickname": "Baudelaire", "group": "deMarche"},
            {"username": "gloom", "nickname": "Gloom", "group": "Excess"},
            {"username": "genesis", "nickname": "Genesis", "group": "Brain Control"},
            {"username": "citrus", "nickname": "Citrus", "group": "Lemon."},
            {"username": "raquel", "nickname": "Raquel Meyers", "group": "Independent"},
            {"username": "hendrix", "nickname": "Hendrix", "group": "Rebels"},
            {"username": "nomax", "nickname": "Nomax", "group": "Mayday!"},
            {"username": "hellfire", "nickname": "Hellfire", "group": "TRSI"},
            # International sceners
            {"username": "ferris", "nickname": "Ferris", "group": "logicoma"},
            {"username": "smash", "nickname": "Smash", "group": "Fairlight"},
            {"username": "gargaj", "nickname": "Gargaj", "group": "Conspiracy"},
            {"username": "mentor", "nickname": "Mentor", "group": "TBL"},
            {"username": "ps", "nickname": "ps", "group": "Rebels"},
            {"username": "virgill", "nickname": "Virgill", "group": "Limp Ninja"},
            {"username": "purple_motion", "nickname": "Purple Motion", "group": "Future Crew"},
            {"username": "truck", "nickname": "Truck", "group": "MFX"},
            # Musicians
            {"username": "chromag", "nickname": "Chromag", "group": "Titan"},
            {"username": "h0ffman", "nickname": "h0ffman", "group": "Unstable Label"},
            {"username": "xerxes", "nickname": "Xerxes", "group": "Titan"},
            {"username": "dipswitch", "nickname": "Dipswitch", "group": "Titan"},
            # Graphicians
            {"username": "bridgeclaw", "nickname": "Bridgeclaw", "group": "Scoopex"},
            {"username": "alien", "nickname": "Alien", "group": "Paradox"},
            {"username": "facet", "nickname": "Facet", "group": "Lemon."},
            {"username": "dan", "nickname": "Dan", "group": "Lemon."},
            # More participants
            {"username": "psenough", "nickname": "ps", "group": "TBC"},
            {"username": "jcl", "nickname": "jcl", "group": "Nuance"},
            {"username": "okkie", "nickname": "Okkie", "group": "TRBL"},
            {"username": "saga", "nickname": "Saga Musix", "group": "OpenMPT"},
        ]

        users = []
        for i, data in enumerate(users_data):
            email = f"{data['username']}@demo.party"
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": data["username"],
                    "is_verified": True,
                },
            )
            if created:
                user.set_password("demo123")
                user.save()
                Profile.objects.create(
                    user=user,
                    nickname=data["nickname"],
                    group=data["group"],
                    visit_listing=True,
                )
            users.append(user)

        self.stdout.write(f"  Created {len(users)} users")
        return users

    def create_compos(self, admin):
        """Create typical demoscene compos"""
        compos_data = [
            {"name": "PC Demo", "description": "Demos for modern PC platforms. No size limit."},
            {"name": "64K Intro", "description": "Intros with maximum executable size of 65536 bytes."},
            {"name": "4K Intro", "description": "Intros with maximum executable size of 4096 bytes."},
            {"name": "Oldschool Demo", "description": "Demos for classic platforms: Amiga, C64, Atari ST, etc."},
            {"name": "Graphics", "description": "2D artwork created with any technique."},
            {"name": "Pixel Graphics", "description": "Pixel art with limited palette and resolution."},
            {"name": "Streaming Music", "description": "Music in MP3, OGG, or similar formats."},
            {"name": "Tracked Music", "description": "Music in tracker formats: XM, IT, MOD, S3M."},
            {"name": "Executable Music", "description": "Music generated by executable code, max 64KB."},
            {"name": "Wild", "description": "Anything goes! Hardware hacks, animations, videos."},
            {"name": "ASCII/ANSI", "description": "Text-mode art using ASCII or ANSI characters."},
            {"name": "Photo", "description": "Photography competition."},
        ]

        compos = []
        for data in compos_data:
            compo, created = Compo.objects.get_or_create(
                name=data["name"],
                defaults={
                    "description": data["description"],
                    "created_by": admin,
                },
            )
            compos.append(compo)

        self.stdout.write(f"  Created {len(compos)} compos")
        return compos

    def create_edition(self, admin):
        """Create the Posadas Party 2025 edition"""
        edition, created = Edition.objects.get_or_create(
            title="Posadas Party 2025",
            defaults={
                "description": """Posadas Party 2025 - The demoscene meets the Mediterranean!

Join us for an unforgettable weekend of creativity, code, and camaraderie in sunny Spain.

Dates: July 11-13, 2025
Location: Centro Cultural Las Cigarreras, Alicante

Featuring:
- Multiple demo competitions
- Live coding sessions
- Seminars and workshops
- Hardware showcase
- Retro gaming area
- Amazing food and drinks

Come celebrate the art of real-time graphics and music with the demoscene community!""",
                "uploaded_by": admin,
                "public": True,
                "open_to_upload": False,
                "open_to_update": False,
            },
        )

        self.stdout.write(f"  Created edition: {edition.title}")
        return edition

    def create_has_compos(self, edition, compos, admin):
        """Link compos to edition with schedules"""
        # Party dates: July 11-13, 2025
        base_date = timezone.make_aware(datetime(2025, 7, 11, 10, 0))

        schedule = [
            # Friday July 11
            (0, timedelta(hours=14)),  # PC Demo - 24:00
            (1, timedelta(hours=16)),  # 64K Intro - 02:00
            # Saturday July 12
            (2, timedelta(hours=24)),  # 4K Intro - 10:00 next day
            (3, timedelta(hours=26)),  # Oldschool Demo - 12:00
            (4, timedelta(hours=28)),  # Graphics - 14:00
            (5, timedelta(hours=30)),  # Pixel Graphics - 16:00
            (6, timedelta(hours=32)),  # Streaming Music - 18:00
            (7, timedelta(hours=34)),  # Tracked Music - 20:00
            # Sunday July 13
            (8, timedelta(hours=48)),  # Executable Music - 10:00
            (9, timedelta(hours=50)),  # Wild - 12:00
            (10, timedelta(hours=52)),  # ASCII/ANSI - 14:00
            (11, timedelta(hours=54)),  # Photo - 16:00
        ]

        for compo_idx, delta in schedule:
            if compo_idx < len(compos):
                HasCompo.objects.get_or_create(
                    edition=edition,
                    compo=compos[compo_idx],
                    defaults={
                        "start": base_date + delta,
                        "show_authors_on_slide": False,
                        "open_to_upload": False,
                        "open_to_update": False,
                        "created_by": admin,
                    },
                )

        self.stdout.write(f"  Linked {len(schedule)} compos to edition")

    def create_productions(self, edition, compos, users):
        """Create productions for each compo"""
        productions_data = {
            "PC Demo": [
                ("Elysium", "Fairlight", "A journey through digital dreams"),
                ("Synthesis", "Conspiracy", "Where code meets art"),
                ("Fractal Horizons", "logicoma", "Exploring infinite complexity"),
                ("Neon Requiem", "TBL", "Cyberpunk tribute demo"),
                ("Solar Wind", "Lemon.", "Space exploration visualizer"),
            ],
            "64K Intro": [
                ("Compressed Reality", "Mercury", "64KB of pure magic"),
                ("Binary Sunset", "Excess", "Procedural landscapes"),
                ("Nanosphere", "Rebels", "Molecular visualization"),
                ("Tiny Universe", "Conspiracy", "Big ideas, small code"),
            ],
            "4K Intro": [
                ("Byte-sized Dreams", "Lemon.", "4KB of creativity"),
                ("Minimal", "logicoma", "Less is more"),
                ("Vertex", "Brain Control", "Pure geometry"),
            ],
            "Oldschool Demo": [
                ("Copper Dreams", "Scoopex", "Amiga 500 demo"),
                ("SID Symphony", "Censor Design", "C64 demo"),
                ("Atari Nights", "DHS", "Atari ST demo"),
                ("Spectrum Colors", "deMarche", "ZX Spectrum demo"),
            ],
            "Graphics": [
                ("Digital Sunrise", "Bridgeclaw", "Morning light study"),
                ("Cybernetic Garden", "Alien", "Bio-mechanical fusion"),
                ("Portrait of Chaos", "Facet", "Abstract portraiture"),
                ("Ocean Depths", "Dan", "Underwater scene"),
                ("Mountain Solitude", "Independent", "Landscape painting"),
            ],
            "Pixel Graphics": [
                ("8-bit Hero", "Scoopex", "Character art"),
                ("Retro City", "Lemon.", "Urban pixel scene"),
                ("Sprite Dreams", "Paradox", "Classic style"),
            ],
            "Streaming Music": [
                ("Electric Dreams", "Titan", "Synthwave journey"),
                ("Bass Frequencies", "Unstable Label", "Electronic exploration"),
                ("Melodic Waves", "Independent", "Ambient soundscape"),
                ("Party Anthem", "Mayday!", "Dancefloor filler"),
            ],
            "Tracked Music": [
                ("Chip Memories", "OpenMPT", "Chiptune nostalgia"),
                ("Module Magic", "Titan", "Classic tracking style"),
                ("XM Experiments", "Limp Ninja", "Experimental tracker"),
                ("Retro Beats", "Future Crew", "Old school vibes"),
            ],
            "Executable Music": [
                ("Synth64K", "TBL", "Procedural synthesis"),
                ("Algorithmic Harmony", "Mercury", "Generated melodies"),
            ],
            "Wild": [
                ("LED Matrix", "Brain Control", "Hardware installation"),
                ("Demo Reel 2025", "TBC", "Animation compilation"),
                ("Oscilloscope Art", "Independent", "Audio visualization"),
            ],
            "ASCII/ANSI": [
                ("Terminal Beauty", "Nuance", "ANSI masterpiece"),
                ("Text Mode", "TRBL", "ASCII art"),
            ],
            "Photo": [
                ("Party Memories", "Organizers", "Event photography"),
                ("Retro Hardware", "Independent", "Computer collection"),
                ("Scene Portraits", "TBC", "Scener portraits"),
            ],
        }

        all_productions = []
        for compo in compos:
            if compo.name in productions_data:
                for prod_data in productions_data[compo.name]:
                    title, authors, description = prod_data
                    # Pick a random user as uploader
                    uploader = random.choice(users)
                    production, created = Production.objects.get_or_create(
                        title=title,
                        edition=edition,
                        compo=compo,
                        defaults={
                            "authors": authors,
                            "description": description,
                            "uploaded_by": uploader,
                        },
                    )
                    all_productions.append(production)

        self.stdout.write(f"  Created {len(all_productions)} productions")
        return all_productions

    def create_voting_config(self, edition):
        """Create voting configuration"""
        config, created = VotingConfiguration.objects.get_or_create(
            edition=edition,
            defaults={
                "voting_mode": "mixed",
                "public_weight": 70,
                "jury_weight": 30,
                "access_mode": "code",
                "results_published": True,
                "results_published_at": timezone.make_aware(
                    datetime(2025, 7, 13, 18, 0)
                ),
                "show_partial_results": False,
            },
        )

        self.stdout.write(f"  Created voting configuration: {config.voting_mode}")
        return config

    def create_jury(self, edition, compos, users):
        """Create jury members"""
        # Select some experienced sceners as jury
        jury_users = users[:5]  # First 5 users as jury

        jury_members = []
        for user in jury_users:
            member, created = JuryMember.objects.get_or_create(
                user=user,
                edition=edition,
                defaults={
                    "notes": f"Experienced scener from {user.profile.group}",
                },
            )
            # Assign random compos to some jury members
            if random.choice([True, False]):
                assigned_compos = random.sample(list(compos), k=min(4, len(compos)))
                member.compos.set(assigned_compos)
            jury_members.append(member)

        self.stdout.write(f"  Created {len(jury_members)} jury members")
        return jury_members

    def create_voting_period(self, edition):
        """Create voting period"""
        period, created = VotingPeriod.objects.get_or_create(
            edition=edition,
            compo=None,  # Applies to all compos
            defaults={
                "start_date": timezone.make_aware(datetime(2025, 7, 11, 10, 0)),
                "end_date": timezone.make_aware(datetime(2025, 7, 13, 16, 0)),
                "is_active": True,
            },
        )

        self.stdout.write(f"  Created voting period")
        return period

    def create_attendance(self, edition, users):
        """Create attendance codes and verifications"""
        # Generate some attendance codes
        codes = AttendanceCode.generate_codes(edition, 50, "PP25")
        self.stdout.write(f"  Generated {len(codes)} attendance codes")

        # Verify all demo users as attendees
        for user in users:
            code = codes.pop(0) if codes else None
            verification, created = AttendeeVerification.objects.get_or_create(
                user=user,
                edition=edition,
                defaults={
                    "is_verified": True,
                    "verification_method": "code",
                    "notes": f"Code: {code.code}" if code else "Manual verification",
                },
            )
            if code:
                code.is_used = True
                code.used_by = user
                code.used_at = timezone.now()
                code.save()

        self.stdout.write(f"  Verified {len(users)} attendees")

    def create_votes(self, productions, users, jury):
        """Create votes for productions"""
        vote_count = 0
        jury_users = [j.user for j in jury]

        for production in productions:
            # Public votes - random subset of users vote
            voting_users = random.sample(users, k=random.randint(5, len(users)))
            for user in voting_users:
                if user not in jury_users:  # Non-jury public votes
                    score = random.randint(5, 10)  # Bias towards higher scores
                    Vote.objects.get_or_create(
                        user=user,
                        production=production,
                        defaults={
                            "score": score,
                            "is_jury_vote": False,
                            "comment": random.choice([
                                "",
                                "Great work!",
                                "Amazing visuals",
                                "Love the music",
                                "Impressive technique",
                                "Very creative",
                            ]),
                        },
                    )
                    vote_count += 1

            # Jury votes
            for jury_member in jury:
                if jury_member.can_vote_in_compo(production.compo):
                    score = random.randint(6, 10)  # Jury is slightly more generous
                    Vote.objects.get_or_create(
                        user=jury_member.user,
                        production=production,
                        defaults={
                            "score": score,
                            "is_jury_vote": True,
                            "comment": random.choice([
                                "",
                                "Solid entry",
                                "Technical excellence",
                                "Creative approach",
                                "Well executed",
                            ]),
                        },
                    )
                    vote_count += 1

        self.stdout.write(f"  Created {vote_count} votes")
