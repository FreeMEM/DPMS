from django.db.models.signals import post_migrate
from django.apps import apps


def create_groups_and_permissions(sender, **kwargs):
    if sender.name != "dpms.users":
        return

    Group = apps.get_model("auth", "Group")
    Permission = apps.get_model("auth", "Permission")

    groups_permissions = {
        "DPMS Admins": [
            "add_compo",
            "change_compo",
            "delete_compo",
            "view_compo",
            "add_edition",
            "change_edition",
            "delete_edition",
            "view_edition",
            "add_file",
            "change_file",
            "delete_file",
            "view_file",
            "add_hascompo",
            "change_hascompo",
            "delete_hascompo",
            "view_hascompo",
            "add_production",
            "change_production",
            "delete_production",
            "view_production",
            "add_profile",
            "change_profile",
            "delete_profile",
            "view_profile",
            "add_user",
            "change_user",
            "delete_user",
            "view_user",
        ],
        "DPMS Users": [
            "add_file",
            "change_file",
            "delete_file",
            "view_file",
            "add_production",
            "change_production",
            "delete_production",
            "view_production",
            "add_profile",
            "change_profile",
            "view_profile",
            "add_user",
            "change_user",
            "view_user",
        ],
    }

    for group_name, permissions in groups_permissions.items():
        group, created = Group.objects.get_or_create(name=group_name)
        if created:
            # Solo asignar permisos si el grupo fue creado
            for perm_codename in permissions:
                try:
                    permission = Permission.objects.get(codename=perm_codename)
                    group.permissions.add(permission)
                except Permission.DoesNotExist:
                    print(
                        f"El permiso '{perm_codename}' no existe. Verifica los permisos."
                    )
        else:
            print(f"El grupo '{group_name}' ya existe. No se modificaron los permisos.")


# Conectar la señal
post_migrate.connect(
    create_groups_and_permissions, dispatch_uid="create_groups_and_permissions"
)
