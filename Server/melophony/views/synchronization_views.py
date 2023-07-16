
import logging
import pytz

from datetime import datetime

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView

from melophony.constants import Status
from melophony.models import Artist, Track, Playlist
from melophony.views.artist_views import create_artist, update_artist
from melophony.views.playlist_views import create_playlist, update_playlist
from melophony.views.track_views import create_track, update_track
from melophony.views.utils import response


MODIFICATION_TYPE = 'modificationType'
OBJECT_TYPE = 'objectType'
MODIFICATION_DATETIME = 'modificationDateTime'
DATETIME_FORMAT = '%Y-%m-%dT%H:%M:%S.%fZ'
MODIFICATION_DATA = 'modificationData'
MANDATORY_KEYS = [MODIFICATION_TYPE, OBJECT_TYPE, MODIFICATION_DATETIME, MODIFICATION_DATA]

ARTIST = "Artist"
TRACK = "Track"
PLAYLIST = "Playlist"

FOREIGN = 'foreign'
MANY = 'many'

CREATION = "CREATION"
UPDATE = "UPDATE"
DELETION = "DELETION"

OBJECT_INFOS = {
    ARTIST: (Artist, {CREATION: create_artist, UPDATE: update_artist}, {}),
    TRACK: (Track, {CREATION: create_track, UPDATE: update_track}, {'artists': ARTIST}),
    PLAYLIST: (Playlist, {CREATION: create_playlist, UPDATE: update_playlist}, {'tracks': TRACK})
}

class SynchronizationView(APIView):

    def __init__(self, **kwargs):
        super(SynchronizationView, self).__init__(**kwargs)
        self.operations = {
            CREATION: self.handle_creation,
            UPDATE: self.handle_update,
            DELETION: self.handle_deletion,
        }
        self.id_translations = {}

    request_body = openapi.Schema(type=openapi.TYPE_ARRAY,
        items=openapi.Schema(type=openapi.TYPE_OBJECT, properties={
            'modificationType': openapi.Schema(type=openapi.TYPE_STRING, description='Type of the modification to perform', enum=['CREATION', 'UPDATE', 'DELETION']),
            'objectType': openapi.Schema(type=openapi.TYPE_STRING, description='Type of the targeted object', enum=['Artist', 'Track', 'Playlist']),
            'modificationDateTime': openapi.Schema(type=openapi.TYPE_STRING, description='Datetime of the modification on the remote application'),
            'modificationData': openapi.Schema(type=openapi.TYPE_OBJECT, description='Data associated with the modification'),
        })
    )
    responses = {
        200: openapi.Response('Synchronization result', openapi.Schema(type=openapi.TYPE_OBJECT, properties={
            'nbUpdates': openapi.Schema(type=openapi.TYPE_INTEGER, description="Number of modifications performed")
        }))
    }

    @swagger_auto_schema(operation_id='synchronization', request_body=request_body, responses=responses)
    def post(self, request):
        nb_updates = 0
        modifications = request.data

        if not self.content_is_valid(modifications):
            logging.error("Malformed modifications, abort")
            return response(err_status=Status.BAD_REQUEST)

        for modification in sorted(modifications, key=lambda x: datetime.strptime(x[MODIFICATION_DATETIME], DATETIME_FORMAT)):
            try:
                model, operations, foreign_keys = OBJECT_INFOS.get(modification[OBJECT_TYPE])
                handle = self.operations.get(modification[MODIFICATION_TYPE])
                result = handle(
                    modification[OBJECT_TYPE],
                    model, operations, foreign_keys,
                    modification[MODIFICATION_DATA],
                    request.user,
                    datetime.strptime(modification[MODIFICATION_DATETIME], DATETIME_FORMAT).replace(tzinfo=pytz.UTC)
                )
                logging.info(f'{modification[OBJECT_TYPE]} {modification[MODIFICATION_TYPE]}: {result}')
                if result:
                    nb_updates = nb_updates + 1
            except Exception as e:
                logging.error(f'Unable to synchronize {modification}: ', e)

        return response({'nbUpdates': nb_updates})


    def handle_creation(self, object_type, object_model, operations, foreign_keys, creation_data, user, modification_datetime):
        if 'id' not in creation_data:
            return False

        remote_id = creation_data.pop('id')
        self.translate_ids(foreign_keys, creation_data)
        def on_object_created(new_object):
            self.id_translations[f'{object_type}_{remote_id}'] = new_object.id
            return {}
        result = operations.get(CREATION)(creation_data, user, creation_data, on_object_created)
        return result.status_code == 201

    def handle_update(self, object_type, object_model, operations, foreign_keys, modification_data, user, modification_datetime):
        if 'id' not in modification_data:
            return False

        self.translate_ids(foreign_keys, modification_data, {'id': object_type})
        objects = object_model.objects.filter(pk=modification_data['id'], user=user)
        if len(objects) != 1:
            return False

        obj = objects[0]
        if obj.lastModification >= modification_datetime:
            logging.warning("Update more recent on server, skipping.")
            return False

        update_fct = lambda obj, modifications: response({'updates': objects.update(**modifications)})
        result = operations.get(UPDATE)(objects[0], modification_data, user, update_fct)
        return result.status_code == 200

    def handle_deletion(self, object_type, object_model, _, __, deletion_data, user, modification_datetime):
        if 'id' not in deletion_data:
            return False

        self.translate_ids([], deletion_data, {'id': object_type})
        nb_updates, _ = object_model.objects.filter(id=deletion_data['id'], user=user).delete()
        return nb_updates > 0

    def translate_ids(self, foreign_keys, data, extra_keys={}):
        for key, related_type in dict(foreign_keys, **extra_keys).items():
            value = data[key]
            if isinstance(value, list):
                data[key] = [self.id_translations.get(f'{related_type}_{o_id}', o_id) for o_id in value]
            else:
                data[key] = self.id_translations.get(f'{related_type}_{value}', value)

    def content_is_valid(self, data):
        if not isinstance(data, list):
            logging.error('Not a list of modifications')
            return False

        for modification in data:
            logging.error(modification[MODIFICATION_DATETIME])

            if not isinstance(modification, dict):
                logging.error('Modification is not a valid object')
                return False
            if not all(key in modification for key in MANDATORY_KEYS):
                logging.error('Missing keys in the modification')
                return False
            if modification['objectType'] not in OBJECT_INFOS.keys():
                logging.error('Unknown object type')
                return False
            if modification['modificationType'] not in self.operations.keys():
                logging.error('Unknown operation, can only create, update or delete')
                return False
            try:
                datetime.strptime(modification[MODIFICATION_DATETIME], DATETIME_FORMAT)
            except ValueError:
                logging.error('modification datetime is not parseable')
                return False

        return True