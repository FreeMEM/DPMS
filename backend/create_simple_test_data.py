#!/usr/bin/env python
"""
Simplified script to create test data for DPMS development.
Run with: docker compose -f local.yml exec backend_party python create_simple_test_data.py
"""

import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django
sys.path.insert(0, '/app/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.local')
django.setup()

from django.contrib.auth.models import Group
from dpms.users.models import User, Profile
from dpms.compos.models import Edition, Compo, HasCompo, Production


print("🚀 Creating test data for DPMS...\n")

# 1. Ensure groups exist
print("1️⃣  Checking groups...")
admin_group, _ = Group.objects.get_or_create(name='DPMS Admins')
user_group, _ = Group.objects.get_or_create(name='DPMS Users')
print(f"   ✓ Groups: {admin_group.name}, {user_group.name}")

# 2. Get admin user and add to group
print("\n2️⃣  Setting up admin user...")
admin = User.objects.filter(email='admin@freemem.space').first()
if admin:
    if not admin.groups.filter(name='DPMS Admins').exists():
        admin.groups.add(admin_group)
        print(f"   ✓ Added {admin.email} to DPMS Admins group")
    print(f"   ✓ Admin ready: {admin.email}")
else:
    print("   ✗ No admin user found. Please create one first.")
    sys.exit(1)

# 3. Create test users
print("\n3️⃣  Creating test users...")
test_users_data = [
    ('scener1@test.com', 'scener1', 'Demo', 'Coder', 'DemoCoder', 'Digital Artists'),
    ('scener2@test.com', 'scener2', 'Pixel', 'Master', 'PixelMaster', 'Pixel Pushers'),
]

test_users = []
for email, username, first, last, nickname, group_name in test_users_data:
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': username,
            'first_name': first,
            'last_name': last,
            'is_verified': True,
        }
    )
    if created:
        user.set_password('REDACTED_PASSWORD')
        user.save()
        user.groups.add(user_group)
        Profile.objects.get_or_create(
            user=user,
            defaults={'nickname': nickname, 'group': group_name}
        )
        print(f"   ✓ Created: {email} / REDACTED_PASSWORD")
    else:
        print(f"   ✓ Exists: {email}")
    test_users.append(user)

# 4. Create Edition
print("\n4️⃣  Creating edition...")
edition, created = Edition.objects.get_or_create(
    title='Posadas Party 2025',
    defaults={
        'description': 'Demo party in Posadas, Córdoba, España',
        'public': True,
        'open_to_upload': True,
        'uploaded_by': admin,
    }
)
print(f"   {'✓ Created' if created else '✓ Exists'}: {edition.title}")

# 5. Create Compos
print("\n5️⃣  Creating competitions...")
compos_data = [
    ('Demo', 'Executable demos showing technical and artistic skills'),
    ('Intro 64k', 'Executable intro limited to 64KB'),
    ('Graphics', 'Still image graphics competition'),
    ('Music', 'Music composition competition'),
    ('Oldschool Demo', 'Demo for classic platforms (Amiga/C64/Atari ST)'),
]

compos = []
for name, desc in compos_data:
    compo, created = Compo.objects.get_or_create(
        name=name,
        defaults={
            'description': desc,
            'created_by': admin,
        }
    )
    compos.append(compo)
    print(f"   {'✓ Created' if created else '✓ Exists'}: {name}")

# 6. Associate Compos with Edition (HasCompo)
print("\n6️⃣  Associating compos with edition...")
for i, compo in enumerate(compos):
    start_time = timezone.now() + timedelta(hours=2*i)
    hascompo, created = HasCompo.objects.get_or_create(
        edition=edition,
        compo=compo,
        defaults={
            'start': start_time,
            'open_to_upload': True,
            'open_to_update': True,
            'show_authors_on_slide': True,
            'created_by': admin,
        }
    )
    print(f"   {'✓ Linked' if created else '✓ Link exists'}: {compo.name} → {edition.title}")

# 7. Create sample productions
print("\n7️⃣  Creating sample productions...")
productions_data = [
    ('Amiga Dreams', 'DemoCoder', 'A tribute to the Amiga computer', compos[0], test_users[0]),
    ('Retro Vibes', 'DemoCoder & PixelMaster', 'Oldschool demo', compos[0], test_users[1]),
    ('Tiny Wonder', 'DemoCoder', 'Everything in 64KB!', compos[1], test_users[0]),
    ('Pixel Paradise', 'PixelMaster', 'Hand-drawn pixel art', compos[2], test_users[1]),
    ('Chippy Beats', 'DemoCoder', 'Chiptune music', compos[3], test_users[0]),
]

for title, authors, desc, compo, user in productions_data:
    production, created = Production.objects.get_or_create(
        title=title,
        edition=edition,
        compo=compo,
        defaults={
            'authors': authors,
            'description': desc,
            'uploaded_by': user,
        }
    )
    print(f"   {'✓ Created' if created else '✓ Exists'}: {title} by {authors}")

print("\n✅ Test data creation complete!")
print("\n📝 Login credentials:")
print("   Admin: admin@freemem.space / REDACTED_PASSWORD")
print("   User 1: scener1@test.com / REDACTED_PASSWORD")
print("   User 2: scener2@test.com / REDACTED_PASSWORD")
print("\n🌐 URLs:")
print("   App Login: http://localhost:3000/app/login")
print("   Competitions: http://localhost:3000/app/compos")
print("   My Productions: http://localhost:3000/app/my-productions")
print("   Admin Panel: http://localhost:8000/admin/")
print("   API Docs: http://localhost:8000/docs/")
