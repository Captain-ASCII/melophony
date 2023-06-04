
from melophony.models import Artist

from melophony.views.utils import response, db_format, Message, Status, create, get, get_all, update, delete, download_image, get_image, delete_associated_image

ARTIST_IMAGES = 'artist_images'


def create_artist(r, artist):
    return response(db_format(create(Artist, artist, {'user': r.user})), message=Message.CREATED, status=Status.CREATED)

def get_artist(r, artist_id):
    return response(get(Artist, artist_id, formatted=True), err_status=Status.NOT_FOUND, err_message=Message.NOT_FOUND)

def update_artist(r, artist, artist_id):
    if 'imageUrl' in artist:
        delete_associated_image(Artist, artist_id)
        artist['imageName'] = download_image(ARTIST_IMAGES, artist['imageUrl'])

    return response(db_format(update(Artist, artist_id, artist)), message='Artist updated successfully')

def delete_artist(r, artist_id):
    return response(db_format(delete(Artist, artist_id)), message='Artist deleted')

def list_artists(r):
    return response(get_all(Artist, formatted=True, filters={'user': r.user.id}))

def get_artist_image(r, artist_id):
    artist = get(Artist, artist_id)
    if artist is not None:
        return get_image(ARTIST_IMAGES, artist.imageName)
    return response(None, err_status=Status.NOT_FOUND, err_message='Artist not found')