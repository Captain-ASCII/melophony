import logging
import json

from django.http import Http404
from django.urls import path, re_path

from . import views
from .views import Status, response

logging.basicConfig(level=logging.INFO)


ALLOWED_PATHS = [
    '/api/login',
    '/api/register',
]
ALLOWED_STARTING_WITH_PATHS = [
    '/admin'
]


def associate_methods(get_method=None, put_method=None, delete_method=None, post_method=None):
    def forward(request, **kwargs):
        try:
            if request.method == 'POST' and post_method is not None:
                return post_method(request, json.loads(request.body.decode('utf-8')), **kwargs)
            elif request.method == 'GET' and get_method is not None:
                return get_method(request, **kwargs)
            elif request.method == 'PUT' and put_method is not None:
                return put_method(request, json.loads(request.body.decode('utf-8')), **kwargs)
            elif request.method == 'DELETE' and delete_method is not None:
                return delete_method(request, **kwargs)
            else:
                raise Http404('No endpoint available for: {} {}'.format(request.method, request.path))
        except Exception as e:
            logging.error('Error while processing request: ', e)
            return response(status=Status.ERROR, message='An error occured: {}'.format(e))

    return forward

urlpatterns = [
    path('api/login', associate_methods(post_method=views.login), name='login'),
    path('api/register', associate_methods(post_method=views.create_user), name='register'),

    path('api/file/<str:file_name>', associate_methods(views.play_file, post_method=views.download_again), name='file_management'),

    path('api/user', associate_methods(views.get_user, post_method=views.create_user), name='create_user'),
    path('api/user/<int:user_id>', associate_methods(views.get_user, views.update_user, views.delete_user)),

    path('api/artist', associate_methods(views.find_artist, post_method=views.create_artist), name='create_artist'),
    path('api/artist/<int:artist_id>', associate_methods(views.get_artist, views.update_artist, views.delete_artist)),
    path('api/artists', views.list_artists, name='list_artists'),
    path('api/artist/image/<str:image_name>', associate_methods(views.get_artist_image), name='get_artist_image'),

    path('api/album', associate_methods(views.find_album, post_method=views.create_album), name='create_album'),
    path('api/album/<int:album_id>', associate_methods(views.get_album, views.update_album, views.delete_album)),
    path('api/albums', views.list_albums, name='list_albums'),

    path('api/track', associate_methods(views.find_track, post_method=views.create_track), name='create_track'),
    path('api/track/<int:track_id>', associate_methods(views.get_track, views.update_track, views.delete_track)),
    path('api/tracks', views.list_tracks, name='list_tracks'),

    path('api/playlist', associate_methods(views.find_playlist, post_method=views.create_playlist), name='create_playlist'),
    path('api/playlist/<int:playlist_id>', associate_methods(views.get_playlist, views.update_playlist, views.delete_playlist)),
    path('api/playlists', views.list_playlists, name='list_playlists'),
    path('api/playlist/image/<str:image_name>', associate_methods(views.get_playlist_image), name='get_playlist_image'),
]