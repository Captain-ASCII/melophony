import json

from django.http import Http404
from django.urls import path

from . import views
from .views import Status, response


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
            return response(status=Status.ERROR, message='An error occured: {}'.format(e))

    return forward

urlpatterns = [
    path('login', associate_methods(post_method=views.login), name='login'),
    path('register', associate_methods(post_method=views.create_user), name='register'),

    path('file/<str:file_name>', views.play_file, name='play_file'),

    path('user', associate_methods(views.get_user, post_method=views.create_user), name='create_user'),
    path('user/<int:user_id>', associate_methods(views.get_user, views.update_user, views.delete_user)),

    path('artist', associate_methods(views.find_artist, post_method=views.create_artist), name='create_artist'),
    path('artist/<int:artist_id>', associate_methods(views.get_artist, views.update_artist, views.delete_artist)),
    path('artists', views.list_artists, name='list_artists'),
    path('artist/image/<str:image_name>', associate_methods(views.get_artist_image), name='get_artist_image'),

    path('album', associate_methods(views.find_album, post_method=views.create_album), name='create_album'),
    path('album/<int:album_id>', associate_methods(views.get_album, views.update_album, views.delete_album)),
    path('albums', views.list_albums, name='list_albums'),

    path('track', associate_methods(views.find_track, post_method=views.create_track), name='create_track'),
    path('track/<int:track_id>', associate_methods(views.get_track, views.update_track, views.delete_track)),
    path('tracks', views.list_tracks, name='list_tracks'),

    path('playlist', associate_methods(views.find_playlist, post_method=views.create_playlist), name='create_playlist'),
    path('playlist/<int:playlist_id>', associate_methods(views.get_playlist, views.update_playlist, views.delete_playlist)),
    path('playlists', views.list_playlists, name='list_playlists'),
    path('playlist/image/<str:image_name>', associate_methods(views.get_playlist_image), name='get_playlist_image'),
]