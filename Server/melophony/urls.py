
from django.conf import settings
from django.urls import path, include

from rest_framework import routers, permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from melophony.views.artist_views import ArtistViewSet
from melophony.views.file_views import FileViewSet
from melophony.views.keys_views import KeysView
from melophony.views.playlist_views import PlaylistViewSet
from melophony.views.synchronization_views import SynchronizationView
from melophony.views.track_views import TrackViewSet
from melophony.views.user_views import UserViewSet


class OptionalSlashRouter(routers.DefaultRouter):
    def __init__(self):
        super().__init__()
        self.trailing_slash = '/?'


router = OptionalSlashRouter()
router.register(r'artist', ArtistViewSet)
router.register(r'file', FileViewSet)
router.register(r'playlist', PlaylistViewSet)
router.register(r'track', TrackViewSet)
router.register(r'user', UserViewSet)

schema_view = get_schema_view(
    openapi.Info(
        title="Melophony API",
        default_version='v1',
        description="Melophony API schema",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="d.benlulu25@gmail.com",),
        license=openapi.License(name="BSD License"),
    ),
    url="https://melophony.ddns.net",
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('api/', include(router.urls)),
    path('api/synchronization', SynchronizationView.as_view()),
    path('api/keys', KeysView.as_view())
]

if settings.DEBUG:
    urlpatterns.append(path('api-auth/', include('rest_framework.urls', namespace='rest_framework')))
    urlpatterns.extend([
        path('swagger<format>', schema_view.without_ui(cache_timeout=0), name='schema-json'),
        path('swagger', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
        path('redoc', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    ])