
import logging

from django.db import transaction
from django.test import TestCase
from mock import patch, mock_open

from melophony.constants import Status, Message
from melophony.models import Artist

from melophony.tests.utils import get_rest_methods, check_response

logging.basicConfig(level=logging.DEBUG)

ARTIST_NAME = 'test_artist_1'
IMAGE_URL = 'test_url'
IMAGE_NAME = 'artist_image'


class ArtistTestCase(TestCase):

    def setUp(self):
        logging.debug('Run test: ' + str(self._testMethodName))
        self.post, self.get, self.patch, self.delete = get_rest_methods(self.client)
        self.post("/api/artist", {'name': ARTIST_NAME, 'imageUrl': IMAGE_URL, 'imageName': IMAGE_NAME})
        self.post("/api/artist", {'name': 'test_artist_2'})

    def test_create_artist(self):
        # Create an artist
        self._check_artist(
            self.post("/api/artist", {'name': 'test_artist_1'}),
            3, 'test_artist_1',
            message=Message.CREATED,
            status=Status.CREATED
        )

        # Create a second artist
        self._check_artist(
            self.post("/api/artist", {'name': 'test_artist_2'}),
            4, 'test_artist_2',
            message=Message.CREATED,
            status=Status.CREATED
        )

    def test_get_artist(self):
        # Unknown artist
        check_response(self, self.get("/api/artist/10"), None, Status.NOT_FOUND, Message.NOT_FOUND)

        # Success
        check_response(self, self.get("/api/artist/1"), {'id': 1, 'name': ARTIST_NAME, 'imageUrl': IMAGE_URL, 'imageName': IMAGE_NAME, 'user': 1})

    @patch('melophony.views.artist_views.download_image')
    def test_update_artist(self, patched_download_image):
        patched_download_image.return_value = 'correct_image_path'
        # Update name
        self._check_artist(
            self.patch("/api/artist/1", {'name': 'new_artist_name'}),
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
            self.patch("/api/artist/2", modifications),
            2, 'new_artist_name', 'new_url', 'correct_image_path', 1,
            Status.SUCCESS, 'Artist updated successfully'
        )

    def test_delete_artist(self):
        self.assertEqual(Artist.objects.filter(pk=1).count(), 1)

        # Can't delete artist that does not exist
        check_response(self, self.delete("/api/artist/10"), None, Status.NOT_FOUND, Message.NOT_FOUND)
        self.assertEqual(Artist.objects.filter(pk=1).count(), 1)

        check_response(
            self,
            self.delete("/api/artist/1"),
            {'id': 1, 'name': ARTIST_NAME, 'imageUrl': IMAGE_URL, 'imageName': IMAGE_NAME, 'user': 1},
            message='Artist deleted'
        )
        self.assertEqual(Artist.objects.filter(pk=1).count(), 0)

    def test_list_artists(self):
        json_data = check_response(self, self.get("/api/artist"), data_check=False)
        self.assertEqual(len(json_data), 2)
        self.assertEqual(json_data[0]['name'], ARTIST_NAME)

        # List after deletion
        self.delete("/api/artist/1")
        json_data = check_response(self, self.get("/api/artist"), data_check=False)
        self.assertEqual(len(json_data), 1)
        self.assertEqual(json_data[0]['name'], 'test_artist_2')

    @patch('builtins.open', new_callable=mock_open, read_data='test_data')
    @patch('os.path.exists')
    def test_get_artist_image(self, patched_exists, _):
        patched_exists.return_value = True
        response = self.get("/api/artist/1/image")
        self.assertEqual(response.content, b'test_data')

        # Unable to find artist
        check_response(self, self.get("/api/artist/10/image"), None, Status.NOT_FOUND, 'Artist not found')

        # Unable to find image
        patched_exists.return_value = False
        check_response(self, self.get("/api/artist/1/image"), None, Status.BAD_REQUEST, 'Error opening image')

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