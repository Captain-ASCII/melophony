
import json
import logging
import uuid

from rest_framework import viewsets

from melophony.constants import Status, Message
from melophony.models import Artist, Track
from melophony.permissions import IsOwnerOfInstance
from melophony.serializers import TrackSerializer

from melophony.views.file_views import create_file_object
from melophony.views.utils import get_required_provider, add_file_with_provider, perform_update
from melophony.views.utils import response, set_many_to_many


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
        success, message, status = add_file_with_provider(provider, file_id, track_request, data)
        if not success:
            return response(err_status=status, err_message=message)

        file = create_file_object({'fileId': file_id})

        track_info = {
            'title': track_request['title'] if 'title' in track_request else 'Default title',
            'file': file,
            'duration': track_request['duration'] if 'duration' in track_request else 0,
            'startTime': 0,
            'endTime': track_request['duration'] if 'duration' in track_request else 0,
            'playCount': 0,
            'rating': 0,
            'progress': 0,
            'user': request.user
        }

        title, duration = provider.get_extra_track_info(track_request, data)
        if title is not None:
            track_info['title'] = title
        if duration is not None:
            track_info['duration'] = duration
            track_info['endTime'] = duration

        artists = []
        if 'artists' in track_request and track_request['artists']:
            artists = track_request['artists']
        elif 'artistName' in track_request and track_request['artistName'] != '':
            artist = Artist.objects.create(name=track_request['artistName'], user=request.user)
            artists = [artist.id]

        track = Track.objects.create(**track_info)

        if len(artists) > 0:
            set_many_to_many(track.artists, Artist, artists)

        return response(self.get_serializer(track).data, message=Message.CREATED, status=Status.CREATED)

    def partial_update(self, request, pk):
        track = self.get_object()
        changes = request.data
        if 'artists' in changes:
            try:
                if track is None:
                    return response(err_status=Status.NOT_FOUND, err_message='No track found for provided id')
                if not set_many_to_many(track.artists, Artist, changes['artists']):
                    return response(err_status=Status.ERROR, err_message='Error while updating track artists')
                del changes['artists']
            except Exception as e:
                logging.error(e)
                return response(err_status=Status.ERROR, err_message='Error while updating track artists')

        return perform_update(self, 'Track updated successfully', track, changes)