
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.decorators import action

from melophony.constants import Status, Message
from melophony.models import Artist
from melophony.negotiation import ImageNegotiation
from melophony.permissions import IsOwnerOfInstance
from melophony.serializers import ArtistSerializer

from melophony.views.utils import response, perform_update, download_image, replace_image, get_image


ARTIST_IMAGES = 'artist_images'


class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = (IsOwnerOfInstance,)

    def get_queryset(self):
        return Artist.objects.filter(user=self.request.user)

    def create(self, request):
        return create_artist(request.data, request.user, None, lambda artist: self.get_serializer(artist).data)

    def partial_update(self, request, pk):
        update_fct = lambda artist, modifications: perform_update(self, 'Artist updated successfully', artist, modifications)
        return update_artist(self.get_object(), request.data, request.user, update_fct)

    @swagger_auto_schema(responses={"200": openapi.Schema(type=openapi.TYPE_FILE)})
    @action(detail=True, methods=["GET"], content_negotiation_class=ImageNegotiation)
    def image(self, request, pk):
        artist = self.get_object()
        if artist is not None:
            return get_image(ARTIST_IMAGES, artist.imageName)
        return response(None, err_status=Status.NOT_FOUND, err_message='Artist not found')


def create_artist(creation_request, user, _, get_data):
    if 'imageUrl' in creation_request and creation_request['imageUrl'] is not None:
        creation_request['imageName'] = download_image(ARTIST_IMAGES, creation_request['imageUrl'])
    artist = Artist.objects.create(**creation_request, user=user)

    return response(get_data(artist), message=Message.CREATED, status=Status.CREATED)


def update_artist(artist, modifications, user, update_fct):
    replace_image(artist, ARTIST_IMAGES, modifications)
    return update_fct(artist, modifications)
