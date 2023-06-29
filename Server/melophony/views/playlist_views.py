
import logging

from django.db import transaction
from rest_framework import viewsets

from melophony.constants import Status, Message
from melophony.models import Playlist, PlaylistTrack, Track
from melophony.serializers import PlaylistSerializer

from melophony.views.utils import response, get, download_image, get_image, delete_associated_image, perform_update, perform_destroy


PLAYLIST_IMAGES = 'playlist_images'

class PlaylistViewSet(viewsets.ModelViewSet):
    queryset = Playlist.objects.all()
    serializer_class = PlaylistSerializer

    def get_queryset(self):
        return Playlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request):
        if 'imageUrl' in request.data and request.data['imageUrl'] != '':
            request.data['imageName'] = download_image(PLAYLIST_IMAGES, request.data['imageUrl'])

        if 'tracks' not in request.data:
            return response(err_status=Status.BAD_REQUEST, err_message='Missing tracks field')

        tracks = request.data['tracks']
        del request.data['tracks']

        try:
            with transaction.atomic():
                try:
                    playlist = Playlist.objects.create(**request.data, user=request.user)
                except:
                    raise Exception('Unable to create playlist, missing name field')

                _set_playlist_tracks(playlist, tracks)
        except Exception as e:
            logging.error(e)
            return response(err_status=Status.BAD_REQUEST, err_message=str(e))

        return response(self.get_serializer(playlist).data, message=Message.CREATED, status=Status.CREATED)

    def partial_update(self, request, pk):
        playlist = self.get_object()
        modifications = request.data
        if 'imageUrl' in modifications:
            delete_associated_image(playlist)
            modifications['imageName'] = download_image(PLAYLIST_IMAGES, modifications['imageUrl'])

        try:
            with transaction.atomic():
                tracks = []
                if 'tracks' in modifications:
                    tracks = modifications['tracks']
                    del modifications['tracks']

                    _set_playlist_tracks(playlist, tracks)
                return perform_update(self, 'Playlist updated successfully', playlist, modifications)
        except Exception as e:
            logging.error(e)
            return response(err_status=Status.BAD_REQUEST, err_message=str(e))

    def destroy(self, request, pk):
        return perform_destroy(self, 'Playlist deleted', request)


def get_playlist_image(r, playlist_id):
    playlist = get(Playlist, playlist_id)
    if playlist is not None:
        return get_image(PLAYLIST_IMAGES, playlist.imageName)
    return response(None, err_status=Status.NOT_FOUND, err_message='Playlist not found')


def _set_playlist_tracks(playlist, tracks):
    PlaylistTrack.objects.filter(playlist=playlist).delete()
    for index, track_id in enumerate(tracks):
        if get(Track, track_id) is None:
            raise Exception('Track with id [' + str(track_id) + '] does not exist')
        PlaylistTrack.objects.create(track_id=track_id, playlist=playlist, order=index)