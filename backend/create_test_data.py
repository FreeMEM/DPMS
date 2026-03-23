#!/usr/bin/env python
"""
Script to create test data for DPMS development.
Run with: docker compose -f local.yml exec backend_party python create_test_data.py
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
from dpms.users.models import User
from dpms.compos.models import Edition, Compo, HasCompo, Production, File


def create_test_data():
    print("🚀 Creating test data for DPMS...\n")

    # 1. Ensure groups exist
    print("1️⃣  Checking groups...")
    admin_group, _ = Group.objects.get_or_create(name='DPMS Admins')
    user_group, _ = Group.objects.get_or_create(name='DPMS Users')
    print(f"   ✓ Groups: {admin_group.name}, {user_group.name}")

    # 2. Create/update admin user
    print("\n2️⃣  Setting up admin user...")
    admin, created = User.objects.get_or_create(
        email='admin@freemem.space',
        defaults={
            'first_name': 'Admin',
            'last_name': 'DPMS',
            'is_staff': True,
            'is_superuser': True,
            'is_verified': True,
        }
    )
    if created:
        from django.utils.crypto import get_random_string
        temp_password = get_random_string(24)
        admin.set_password(temp_password)
        admin.save()
        print(f"   ✓ Created admin user: {admin.email} / {temp_password}")
    else:
        print(f"   ✓ Admin user exists: {admin.email}")

    # Add to DPMS Admins group
    if not admin.groups.filter(name='DPMS Admins').exists():
        admin.groups.add(admin_group)
        print(f"   ✓ Added admin to DPMS Admins group")

    # 3. Create test users
    print("\n3️⃣  Creating test users...")
    test_users = [
        {
            'email': 'scener1@test.com',
            'username': 'scener1',
            'first_name': 'Demo',
            'last_name': 'Coder',
            'nickname': 'DemoCoder',
            'group_name': 'Digital Artists',
        },
        {
            'email': 'scener2@test.com',
            'username': 'scener2',
            'first_name': 'Pixel',
            'last_name': 'Master',
            'nickname': 'PixelMaster',
            'group_name': 'Pixel Pushers',
        },
    ]

    for user_data in test_users:
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'username': user_data['username'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'is_verified': True,
            }
        )
        if created:
            user_password = get_random_string(16)
            user.set_password(user_password)
            user.save()
            user.groups.add(user_group)

            # Create profile
            from dpms.users.models import Profile
            Profile.objects.get_or_create(
                user=user,
                defaults={
                    'nickname': user_data['nickname'],
                    'group': user_data['group_name'],
                }
            )
            print(f"   ✓ Created user: {user.email} / {user_password}")
        else:
            print(f"   ✓ User exists: {user.email}")

    # 4. Create Edition (Posadas Party 2025)
    print("\n4️⃣  Creating edition...")
    edition, created = Edition.objects.get_or_create(
        title='Posadas Party 2025',
        defaults={
            'description': 'Demo party gathering for Amiga and retro computing enthusiasts in Posadas, Córdoba, España',
            'public': True,
            'open_to_upload': True,
            'uploaded_by': admin,
        }
    )
    if created:
        print(f"   ✓ Created edition: {edition.title}")
    else:
        print(f"   ✓ Edition exists: {edition.title}")

    # 5. Create Compos
    print("\n5️⃣  Creating competitions...")
    compos_data = [
        {
            'name': 'Demo',
            'description': 'Executable demos showing technical and artistic skills',
            'platform': 'Amiga OCS/ECS',
            'rules': '- Max 3 minutes\n- Must run on Amiga 500 (OCS/ECS)\n- No external files',
        },
        {
            'name': 'Intro 64k',
            'description': 'Executable intro limited to 64KB',
            'platform': 'Amiga OCS/ECS',
            'rules': '- Max 64KB file size\n- Must be self-contained',
        },
        {
            'name': 'Graphics',
            'description': 'Still image graphics competition',
            'platform': 'Any',
            'rules': '- Original artwork only\n- Max resolution 1920x1080\n- PNG or JPG format',
        },
        {
            'name': 'Music',
            'description': 'Music composition competition',
            'platform': 'Tracked/Synthesized',
            'rules': '- Max 5 minutes\n- MOD, XM, or MP3 format',
        },
        {
            'name': 'Oldschool Demo',
            'description': 'Demo for classic platforms',
            'platform': 'Amiga 500/C64/Atari ST',
            'rules': '- Must run on original hardware\n- Max 3 minutes',
        },
    ]

    compos = []
    for compo_data in compos_data:
        compo, created = Compo.objects.get_or_create(
            name=compo_data['name'],
            defaults={
                'description': compo_data['description'],
                'platform': compo_data['platform'],
                'rules': compo_data['rules'],
                'uploaded_by': admin,
            }
        )
        compos.append(compo)
        if created:
            print(f"   ✓ Created compo: {compo.name}")
        else:
            print(f"   ✓ Compo exists: {compo.name}")

    # 6. Associate Compos with Edition (HasCompo)
    print("\n6️⃣  Associating compos with edition...")
    for i, compo in enumerate(compos):
        start_time = timezone.now() + timedelta(hours=2*i)
        hascompo, created = HasCompo.objects.get_or_create(
            edition=edition,
            compo=compo,
            defaults={
                'compo_start': start_time,
                'open_to_upload': True,
                'open_to_update': True,
                'show_authors_on_slide': True,
                'uploaded_by': admin,
            }
        )
        if created:
            print(f"   ✓ Associated: {compo.name} → {edition.title}")
        else:
            print(f"   ✓ Association exists: {compo.name} → {edition.title}")

    # 7. Create sample productions
    print("\n7️⃣  Creating sample productions...")
    scener1 = User.objects.get(email='scener1@test.com')
    scener2 = User.objects.get(email='scener2@test.com')

    productions_data = [
        {
            'title': 'Amiga Dreams',
            'authors': 'DemoCoder',
            'description': 'A tribute to the legendary Amiga computer',
            'compo': compos[0],  # Demo
            'user': scener1,
        },
        {
            'title': 'Retro Vibes',
            'authors': 'DemoCoder & PixelMaster',
            'description': 'Oldschool demo with modern effects',
            'compo': compos[0],  # Demo
            'user': scener2,
        },
        {
            'title': 'Tiny Wonder',
            'authors': 'DemoCoder',
            'description': 'Everything fits in 64KB!',
            'compo': compos[1],  # Intro 64k
            'user': scener1,
        },
        {
            'title': 'Pixel Paradise',
            'authors': 'PixelMaster',
            'description': 'Hand-drawn pixel art landscape',
            'compo': compos[2],  # Graphics
            'user': scener2,
        },
        {
            'title': 'Chippy Beats',
            'authors': 'DemoCoder',
            'description': 'Chiptune music with nostalgic vibes',
            'compo': compos[3],  # Music
            'user': scener1,
        },
    ]

    for prod_data in productions_data:
        production, created = Production.objects.get_or_create(
            title=prod_data['title'],
            edition=edition,
            compo=prod_data['compo'],
            defaults={
                'authors': prod_data['authors'],
                'description': prod_data['description'],
                'uploaded_by': prod_data['user'],
            }
        )
        if created:
            print(f"   ✓ Created production: {production.title} by {production.authors}")
        else:
            print(f"   ✓ Production exists: {production.title}")

    print("\n✅ Test data creation complete!")
    print("\n📝 Login credentials were printed above during creation.")
    print("\n🌐 URLs:")
    print("   Landing: http://localhost:8000/")
    print("   App: http://localhost:3000/app/login")
    print("   Admin: http://localhost:8000/admin/")
    print("   API Docs: http://localhost:8000/docs/")


if __name__ == '__main__':
    create_test_data()
