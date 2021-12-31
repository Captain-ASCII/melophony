from django.apps import AppConfig


class MelophonyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    jwt_secret = 'ILoveMarieBenLulu-28072021'
    name = 'melophony'
