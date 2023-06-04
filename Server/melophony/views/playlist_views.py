
import logging

from django.db import models, transaction

from melophony.models import Playlist, PlaylistTrack, Track
from melophony.views.utils import response, db_format, Message, Status, update, delete, get, get_all, download_image, get_image, delete_associated_image, act


PLAYLIST_IMAGES = 'playlist_images'


def create_playlist(r, provided_playlist):
    if 'imageUrl' in provided_playlist and provided_playlist['imageUrl'] != '':
        provided_playlist['imageName'] = download_image(PLAYLIST_IMAGES, provided_playlist['imageUrl'])

    if 'tracks' not in provided_playlist:
        return response(err_status=Status.BAD_REQUEST, err_message='Missing tracks field')

    tracks = provided_playlist['tracks']
    del provided_playlist['tracks']

    try:
        with transaction.atomic():
            playlist = act(lambda: Playlist.objects.create(**provided_playlist, user=r.user))
            if playlist is None:
                raise Exception('Unable to create playlist, missing name field')

            _set_playlist_tracks(playlist, tracks)
    except Exception as e:
        logging.error(e)
        return response(err_status=Status.BAD_REQUEST, err_message=str(e))

    return response(db_format(playlist, foreign_keys=['tracks', 'artists', 'file']), message=Message.CREATED, status=Status.CREATED)

def get_playlist(r, playlist_id):
    return response(
        get(Playlist, playlist_id, formatted=True, foreign_keys=['tracks', 'artists', 'file']),
        err_status=Status.NOT_FOUND, err_message=Message.NOT_FOUND
    )

def update_playlist(r, modifications, playlist_id):
    if 'imageUrl' in modifications:
        delete_associated_image(Playlist, playlist_id)
        modifications['imageName'] = download_image(PLAYLIST_IMAGES, modifications['imageUrl'])

    try:
        with transaction.atomic():
            tracks = []
            if 'tracks' in modifications:
                tracks = modifications['tracks']
                del modifications['tracks']

            playlist = update(Playlist, playlist_id, modifications)
            logging.info(tracks)
            _set_playlist_tracks(playlist, tracks)

        logging.info(PlaylistTrack.objects.filter(playlist=playlist))
    except Exception as e:
        logging.error(e)
        return response(err_status=Status.BAD_REQUEST, err_message=str(e))

    return response(db_format(playlist, foreign_keys=['tracks', 'artists', 'file']), message='Playlist updated successfully')

def delete_playlist(r, playlist_id):
    return response(db_format(delete(Playlist, playlist_id), foreign_keys=['tracks', 'artists', 'file']), message='Playlist deleted')

def list_playlists(r):
    return response(get_all(Playlist, formatted=True, filters={'user': r.user.id}, foreign_keys=['tracks', 'artists', 'file']))

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
        act(lambda: PlaylistTrack.objects.create(track_id=track_id, playlist=playlist, order=index))