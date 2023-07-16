
import filetype
import logging
import os

from datetime import datetime

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

from melophony.track_providers import TrackProviderInterface

MAGIC_LENGTH_CONSTANT = 0.000060105


class TrackProvider(TrackProviderInterface):

    def get_provider_key(self):
        return 'upload_file_provider'

    def get_extra_track_info(self, track, data):
        title = "uploaded_track_" + datetime.now().isoformat()
        duration = None

        if 'title' in track:
            title = track['title']
        if 'duration' in track:
            duration = track['duration']
        elif data is not None:
            duration = round(len(data) * MAGIC_LENGTH_CONSTANT)

        return title, duration

    def add_file(self, file_path, parameters, data):
        if data is None:
            return False, "No file provided"

        default_storage.save(file_path, ContentFile(data.read()))
        if not self._check_type(file_path):
            os.remove(file_path)
            return False, "Incorrect file type provided"

        return True, "File uploaded"

    def _check_type(self, file_path):
        kind = filetype.guess(file_path)
        if kind is None:
            logging.error('Unable to get file type, considering incorrect')
            return False

        logging.info(f'File: (extension: {kind.extension}, MIME type: {kind.mime}')
        return kind.mime == 'audio/mp4'