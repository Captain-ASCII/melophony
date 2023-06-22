import logging
import json

from django.http import Http404
from django.urls import path

from melophony.views.utils import Status, response
from melophony.views.file_views import play_file, add_file
from melophony.views.user_views import get_user, update_user, delete_user, create_user, login
from melophony.views.artist_views import create_artist, get_artist, update_artist, delete_artist, list_artists, get_artist_image
from melophony.views.track_views import create_track, get_track, update_track, delete_track, list_tracks
from melophony.views.playlist_views import create_playlist, get_playlist, update_playlist, delete_playlist, list_playlists, get_playlist_image

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
                json_body = None
                file_data = None
                contentType = request.headers.get('Content-Type')

                if contentType == 'application/json':
                    json_body = json.loads(request.body.decode('utf-8'))
                elif contentType.startswith('multipart/form-data'):
                    json_body = json.loads(request.POST['json'])
                    file_data = request.FILES['data'] if 'data' in request.FILES else None

                if json_body is None:
                    raise Http404('No endpoint available for: {} {}'.format(request.method, request.path))

                return post_method(request, json_body, file_data, **kwargs)
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
    path('api/login', associate_methods(post_method=login), name='login'),
    path('api/register', associate_methods(post_method=create_user), name='register'),

    path('api/file/<str:file_name>', associate_methods(play_file, post_method=add_file), name='file_management'),

    path('api/user', associate_methods(get_user, update_user, delete_user, create_user), name='user_management'),

    path('api/artist', associate_methods(post_method=create_artist), name='artist_management'),
    path('api/artist/<int:artist_id>', associate_methods(get_artist, update_artist, delete_artist)),
    path('api/artist/<int:artist_id>/image', associate_methods(get_artist_image), name='get_artist_image'),
    path('api/artists', list_artists, name='list_artists'),

    path('api/track', associate_methods(post_method=create_track), name='create_track'),
    path('api/track/<int:track_id>', associate_methods(get_track, update_track, delete_track)),
    path('api/tracks', list_tracks, name='list_tracks'),

    path('api/playlist', associate_methods(post_method=create_playlist), name='create_playlist'),
    path('api/playlist/<int:playlist_id>', associate_methods(get_playlist, update_playlist, delete_playlist)),
    path('api/playlists', list_playlists, name='list_playlists'),
    path('api/playlist/<int:playlist_id>/image', associate_methods(get_playlist_image), name='get_playlist_image'),
]