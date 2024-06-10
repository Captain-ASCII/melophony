
import json
import logging
import threading
import uuid

from rest_framework import viewsets

from melophony.constants import Status, Message
from melophony.models import Artist, Track
from melophony.permissions import IsOwnerOfInstance
from melophony.serializers import TrackSerializer

from melophony.views.file_views import create_file_object
from melophony.views.utils import get_required_provider, add_file_with_provider, perform_update
from melophony.views.utils import response, set_many_to_many

TIMEOUT_BEFORE_CREATION_IN_PROGRESS_RESPONSE = 25


class TrackViewSet(viewsets.ModelViewSet):
    queryset = Track.objects.all()
    serializer_class = TrackSerializer
    permission_classes = [IsOwnerOfInstance]

    def get_queryset(self):
        return Track.objects.filter(user=self.request.user)

    def create(self, request):
        data = None
        contentType = request.headers.get('Content-Type')
        if contentType is not None and contentType.startswith('multipart/form-data'):
            track_request = json.loads(request.POST['json']) if 'json' in request.POST else None
            data = request.FILES['data'] if 'data' in request.FILES else None
        else:
            track_request = request.data

        provider, message, status = get_required_provider(track_request)
        if provider is None:
            return response(err_status=status, err_message=message)

        file_id = str(uuid.uuid4())
        logging.info(f"Add file through provider: {provider}")
        success, message, status = add_file_with_provider(provider, file_id, track_request, data)
        if not success:
            return response(err_status=status, err_message=message)

        file = create_file_object({'fileId': file_id})

        track_info = {
            'title': track_request['title'] if 'title' in track_request else 'Default title',
            'file': file.id,
            'duration': track_request['duration'] if 'duration' in track_request else 0,
            'startTime': 0,
            'endTime': track_request['duration'] if 'duration' in track_request else 0,
            'playCount': 0,
            'rating': 0,
            'progress': 0,
        }

        # List object to allow thread mutability and result
        output = [response({}, message='Creation in progress...', status=Status.CREATED)]

        def add_extra_info(track_request, data):
            logging.info(f"Get file extra info from provider: {provider}")
            title, duration = provider.get_extra_track_info(track_request, data)
            if title is not None:
                track_info['title'] = title
            if duration is not None:
                track_info['duration'] = duration
                track_info['endTime'] = duration

            logging.info(f"Done adding file with provider: {provider}")
            output[0] = create_track(track_request, request.user, track_info, lambda track: self.get_serializer(track).data)

        t = threading.Thread(target=add_extra_info, args=(track_request, data,))
        t.start()
        t.join(timeout=TIMEOUT_BEFORE_CREATION_IN_PROGRESS_RESPONSE)

        return output[0]

    def partial_update(self, request, pk):
        update_fct = lambda track, modifications: perform_update(self, 'Track updated successfully', track, modifications)
        return update_track(self.get_object(), request.data, request.user, update_fct)


def create_track(creation_request, user, track_data, get_data):
    artists = []
    if 'artists' in creation_request and creation_request['artists']:
        artists = creation_request.pop('artists')
    elif 'artistName' in creation_request and creation_request['artistName'] != '':
        artist = Artist.objects.create(name=creation_request.pop('artistName'), user=user)
        artists = [artist.id]

    track_data['file_id'] = track_data.pop('file')
    track = Track.objects.create(**track_data, user=user)

    if len(artists) > 0:
        set_many_to_many(track.artists, Artist, artists, user)

    return response(get_data(track), message=Message.CREATED, status=Status.CREATED)


def update_track(track, modifications, user, update_fct):
    if 'artists' in modifications:
        try:
            if track is None:
                return response(err_status=Status.NOT_FOUND, err_message='No track found for provided id')
            if not set_many_to_many(track.artists, Artist, modifications['artists'], user):
                return response(err_status=Status.ERROR, err_message='Error while updating track artists')
            del modifications['artists']
        except Exception as e:
            logging.error(e)
            return response(err_status=Status.ERROR, err_message='Error while updating track artists')

    return update_fct(track, modifications)