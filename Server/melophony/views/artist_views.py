
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.decorators import action

from melophony.constants import Status
from melophony.models import Artist
from melophony.negotiation import ImageNegotiation
from melophony.permissions import IsOwnerOfInstance
from melophony.serializers import ArtistSerializer

from melophony.views.utils import response, perform_update, get, download_image, get_image, delete_associated_image


ARTIST_IMAGES = 'artist_images'


class ArtistViewSet(viewsets.ModelViewSet):
    queryset = Artist.objects.all()
    serializer_class = ArtistSerializer
    permission_classes = (IsOwnerOfInstance,)

    def get_queryset(self):
        return Artist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def partial_update(self, request, pk):
        artist = self.get_object()
        imageUrl = request.data.get('imageUrl')
        if imageUrl is not None:
            delete_associated_image(artist)
            request.data['imageName'] = download_image(ARTIST_IMAGES, imageUrl)

        return perform_update(self, 'Artist updated successfully', artist, request.data)

    @swagger_auto_schema(responses={"200": openapi.Schema(type=openapi.TYPE_FILE)})
    @action(detail=True, methods=["GET"], content_negotiation_class=ImageNegotiation)
    def image(self, request, pk):
        artist = self.get_object()
        if artist is not None:
            return get_image(ARTIST_IMAGES, artist.imageName)
        return response(None, err_status=Status.NOT_FOUND, err_message='Artist not found')