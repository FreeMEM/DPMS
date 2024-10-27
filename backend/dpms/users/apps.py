""" _Users app """

from django.apps import AppConfig


class UsersAppConfig(AppConfig):

    name = "dpms.users"
    verbose_name = "Users"

    def ready(self):
        import dpms.users.signals
