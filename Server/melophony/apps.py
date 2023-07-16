
import logging
import sys

from django.apps import AppConfig
from melophony.track_providers import add_installed_providers
from melophony.utils import get_server_configuration


class MelophonyConfig(AppConfig):
    name = 'melophony'
    default_auto_field = 'django.db.models.BigAutoField'

    configuration = get_server_configuration()
    if configuration is not None and "jwtSecret" in configuration:
        jwt_secret = configuration["jwtSecret"]
    else:
        logging.error("JWT secret must be set in configuration.json (key: jwtSecret)")
        sys.exit(1)

    def ready(self):
        add_installed_providers()
