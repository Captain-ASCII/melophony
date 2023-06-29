
from rest_framework import viewsets

from melophony.constants import Status
from melophony.models import Artist
from melophony.permissions import IsOwnerOfInstance
from melophony.serializers import ArtistSerializer

from melophony.views.utils import response, perform_update, perform_destroy, get, download_image, get_image, delete_associated_image


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

    def destroy(self, request, pk):
        return perform_destroy(self, 'Artist deleted', request)


def get_artist_image(r, artist_id):
    artist = get(Artist, artist_id)
    if artist is not None:
        return get_image(ARTIST_IMAGES, artist.imageName)
    return response(None, err_status=Status.NOT_FOUND, err_message='Artist not found')