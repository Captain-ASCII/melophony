
from django.conf import settings
from django.urls import path, include

from rest_framework import routers

from melophony.views.artist_views import ArtistViewSet, get_artist_image
from melophony.views.file_views import FileViewSet
from melophony.views.playlist_views import PlaylistViewSet, get_playlist_image
from melophony.views.track_views import TrackViewSet
from melophony.views.user_views import UserViewSet, login


class OptionalSlashRouter(routers.DefaultRouter):
    def __init__(self):
        super().__init__()
        self.trailing_slash = 's?/?'


router = OptionalSlashRouter()
router.register(r'artist', ArtistViewSet)
router.register(r'file', FileViewSet)
router.register(r'playlist', PlaylistViewSet)
router.register(r'track', TrackViewSet)
router.register(r'user', UserViewSet)


urlpatterns = [
    path('api/login', login, name='login'),
    path('api/artist/<int:artist_id>/image', get_artist_image),
    path('api/playlist/<int:playlist_id>/image', get_playlist_image),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns.append(path('api-auth/', include('rest_framework.urls', namespace='rest_framework')))