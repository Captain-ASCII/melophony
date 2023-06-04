
import logging

from django.db import transaction
from django.test import TestCase
from mock import patch, mock_open

from melophony.models import Artist
from melophony.views.artist_views import create_artist, get_artist, update_artist, delete_artist, list_artists, get_artist_image
from melophony.views.utils import Status, Message

from melophony.tests.utils import get_request, check_response

logging.basicConfig(level=logging.DEBUG)

ARTIST_NAME = 'test_artist_1'
IMAGE_URL = 'test_url'
IMAGE_NAME = 'artist_image'


class ArtistTestCase(TestCase):

    def setUp(self):
        logging.debug('Run test: ' + str(self._testMethodName))
        self.request = get_request()
        create_artist(self.request, {'name': ARTIST_NAME, 'imageUrl': IMAGE_URL, 'imageName': IMAGE_NAME})
        create_artist(self.request, {'name': 'test_artist_2'})

    def test_create_artist(self):
        # Create an artist
        self._check_artist(
            create_artist(self.request, {'name': 'test_artist_1'}),
            3, 'test_artist_1',
            message=Message.CREATED,
            status=Status.CREATED
        )

        # Create a second artist
        self._check_artist(
            create_artist(self.request, {'name': 'test_artist_2'}),
            4, 'test_artist_2',
            message=Message.CREATED,
            status=Status.CREATED
        )

        # Trying to create an artist with same ID returns an error
        check_response(self, create_artist(self.request, {'id': 3, 'name': 'test_artist_3'}), None, Status.BAD_REQUEST, Message.ERROR)

    def test_get_artist(self):
        # Unknown artist
        check_response(self, get_artist(self.request, -1), None, Status.NOT_FOUND, Message.NOT_FOUND)

        # Success
        check_response(
            self,
            get_artist(self.request, 1),
            {'id': 1, 'name': ARTIST_NAME, 'imageUrl': IMAGE_URL, 'imageName': IMAGE_NAME, 'user': 1}
        )

    @patch('melophony.views.artist_views.download_image')
    @patch('melophony.views.artist_views.delete_associated_image')
    def test_update_artist(self, patched_delete_image, patched_download_image):
        patched_download_image.return_value = 'correct_image_path'
        # Update name
        self._check_artist(
            update_artist(self.request, {'name': 'new_artist_name'}, 1),
            1, 'new_artist_name', IMAGE_URL, IMAGE_NAME, 1,
            Status.SUCCESS, 'Artist updated successfully',
        )

        # Full update
        modifications = {
            'name': 'new_artist_name',
            'imageUrl': 'new_url',
            'imageName': 'supplied_name_that_should_not_be_used'
        }
        self._check_artist(
            update_artist(self.request, modifications, 2),
            2, 'new_artist_name', 'new_url', 'correct_image_path', 1,
            Status.SUCCESS, 'Artist updated successfully'
        )

    def test_delete_artist(self):
        self.assertEqual(Artist.objects.filter(pk=1).count(), 1)
        check_response(
            self,
            delete_artist(self.request, 1),
            {'id': None, 'name': ARTIST_NAME, 'imageUrl': IMAGE_URL, 'imageName': IMAGE_NAME, 'user': 1},
            message='Artist deleted'
        )
        self.assertEqual(Artist.objects.filter(pk=1).count(), 0)

    def test_list_artists(self):
        json_data = check_response(self, list_artists(self.request), data_check=False)
        self.assertEqual(len(json_data), 2)
        self.assertEqual(json_data[0]['name'], ARTIST_NAME)

        # List after deletion
        delete_artist(self.request, 1)
        json_data = check_response(self, list_artists(self.request), data_check=False)
        self.assertEqual(len(json_data), 1)
        self.assertEqual(json_data[0]['name'], 'test_artist_2')

    @patch('builtins.open', new_callable=mock_open, read_data='test_data')
    @patch('os.path.exists')
    def test_get_artist_image(self, patched_exists, _):
        patched_exists.return_value = True
        response = get_artist_image(self.request, 1)
        self.assertEqual(response.content, b'test_data')

        # Unable to find artist
        check_response(self, get_artist_image(self.request, -1), None, Status.NOT_FOUND, 'Artist not found')

        # Unable to find image
        patched_exists.return_value = False
        check_response(self, get_artist_image(self.request, 1), None, Status.BAD_REQUEST, 'Error opening image')

    def _check_artist(self, response, artist_id, name, image_url=None, image_name=None, user_id=1, status=Status.SUCCESS, message=Message.SUCCESS):
        self._check_db(artist_id, name, image_url, image_name, user_id)
        check_response(
            self, response,
            {'id': artist_id, 'name': name, 'imageUrl': image_url, 'imageName': image_name, 'user': user_id},
            status, message
        )

    def _check_db(self, artist_id, name, image_url=None, image_name=None, user_id=1):
        try:
            with transaction.atomic():
                db_artist = Artist.objects.get(pk=artist_id)
                self.assertIsNotNone(db_artist)
                self.assertEqual(db_artist.name, name)
                self.assertEqual(db_artist.imageUrl, image_url)
                self.assertEqual(db_artist.imageName, image_name)
                self.assertEqual(db_artist.user.id, user_id)
        except Exception as e:
            pass