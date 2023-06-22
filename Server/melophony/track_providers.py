
import importlib.util
import logging
import os
import sys

from abc import abstractmethod

logging.basicConfig(level=logging.INFO)

PROVIDERS = {}

def add_installed_providers():
    providers_dir = os.path.join(os.path.dirname(__file__), "providers")
    for provider_file in os.listdir(providers_dir):
        if provider_file.endswith(".py"):
            add_installed_provider(os.path.join(providers_dir, provider_file))

def add_installed_provider(file_path):
    module_name = f"melophony.providers.{os.path.splitext(os.path.basename(file_path))[0]}"
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    provider_module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = provider_module
    spec.loader.exec_module(provider_module)
    provider = provider_module.TrackProvider()
    key = provider.get_provider_key()
    if key is not None:
        register_provider(key, provider)


def register_provider(provider_key, provider):
    PROVIDERS[provider_key] = provider
    logging.info(f"Added provider: {provider} for key: {provider_key}")

def unregister_provider(provider_key):
    del PROVIDERS[provider_key]

def get_provider(provider_key):
    return PROVIDERS.get(provider_key, None)


class TrackProviderInterface:
    """
    Interface used to allow providing tracks from any service.
    Provider classes must be installed in the providers directory, be named "TrackProvider" and subclass this interface.
    They also must implement the following methods in order to let Melophony retrieve the track provider requested by the front-end,
    then it will ask for more information (title, duration) calling get_extra_track_info() before finally calling add_file().
    """

    @abstractmethod
    def get_provider_key(self):
        """
        Define the key used to retrieve this provider when adding files

        :returns: the key of this provider
        """
        pass

    @abstractmethod
    def get_extra_track_info(self, track_request):
        """
        Allow providers to add extra information to the track before creating a track in DB.

        :param track_request: Track adding request made from the front-office
        :returns: a 2-tuple composed of the title of the track and the duration of it. If no title is provided, then the one transfered in the request is kept.
        """
        pass

    @abstractmethod
    def add_file(self, file_path, parameters, data):
        """
        Add a file to the track directory using the given parameters

        :param file_path: The path to the file to be added
        :param parameters: The parameters of the track request received from the front-office
        :param data: The raw data sent with the parameters (for direct upload for example)
        :returns: a 2-tuple composed of a result boolean and a message (may explain why the request failed).
        """
        pass