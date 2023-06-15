
from django.apps import AppConfig
from melophony.track_providers import add_installed_providers


class MelophonyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    # TODO: Remove this !!!
    jwt_secret = 'ILoveMarieBenLulu-28072021'
    name = 'melophony'

    def ready(self):
        add_installed_providers()
