
import logging

from django.db import transaction
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.decorators import action

from melophony.constants import Status, Message
from melophony.models import Playlist, PlaylistTrack, Track
from melophony.negotiation import ImageNegotiation
from melophony.serializers import PlaylistSerializer

from melophony.views.utils import response, get, download_image, replace_image, get_image, perform_update


PLAYLIST_IMAGES = 'playlist_images'

class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request):
        return create_playlist(request.data, request.user, None, lambda playlist: self.get_serializer(playlist).data)

    def partial_update(self, request, pk):
        update_fct = lambda playlist, modifications: perform_update(self, 'Playlist updated successfully', playlist, modifications)
        return update_playlist(self.get_object(), request.data, request.user, update_fct)

    @swagger_auto_schema(operation_id='playlist_image', responses={"200": openapi.Schema(type=openapi.TYPE_FILE)})
    @action(detail=True, methods=["GET"], url_path=r'image/(?P<imageName>[a-zA-Z0-9-]*)', content_negotiation_class=ImageNegotiation)
    def image(self, request, pk, imageName):
        playlist = self.get_object()
        if playlist is not None:
            return get_image(PLAYLIST_IMAGES, playlist.imageName)
        return response(None, err_status=Status.NOT_FOUND, err_message='Playlist not found')


def create_playlist(creation_request, user, _, get_data):
    if 'imageUrl' in creation_request and creation_request['imageUrl'] != '':
        creation_request['imageName'] = download_image(PLAYLIST_IMAGES, creation_request['imageUrl'])

    if 'tracks' not in creation_request:
        return response(err_status=Status.BAD_REQUEST, err_message='Missing tracks field')

    tracks = creation_request['tracks']
    del creation_request['tracks']

    try:
        with transaction.atomic():
            try:
                playlist = Playlist.objects.create(**creation_request, user=user)
            except:
                raise Exception('Unable to create playlist, missing name field')

            set_playlist_tracks(playlist, tracks, user)
    except Exception as e:
        logging.error(e)
        return response(err_status=Status.BAD_REQUEST, err_message=str(e))

    return response(get_data(playlist), message=Message.CREATED, status=Status.CREATED)


def update_playlist(playlist, modifications, user, update_fct):
    modifications = replace_image(playlist, PLAYLIST_IMAGES, modifications)

    try:
        with transaction.atomic():
            tracks = []
            if 'tracks' in modifications:
                tracks = modifications['tracks']
                del modifications['tracks']

                set_playlist_tracks(playlist, tracks, user)
            return update_fct(playlist, modifications)
    except Exception as e:
        logging.error(e)
        return response(err_status=Status.BAD_REQUEST, err_message=str(e))


def set_playlist_tracks(playlist, tracks, user):
    PlaylistTrack.objects.filter(playlist=playlist).delete()
    for index, track_id in enumerate(tracks):
        if get(Track, track_id, user) is None:
            raise Exception('Track with id [' + str(track_id) + '] does not exist')
        PlaylistTrack.objects.create(track_id=track_id, playlist=playlist, order=index)