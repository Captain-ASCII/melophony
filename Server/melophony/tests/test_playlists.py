
import logging

from django.test import TestCase
from mock import patch, mock_open

from melophony.constants import Status, Message
from melophony.models import Playlist
from melophony.track_providers import register_provider

from melophony.tests.utils import get_rest_methods, get_request, check_response, PROVIDER_KEY, TestProvider, get
from melophony.tests.utils import get_expected_playlist, get_expected_track, get_expected_artist, assert_dict_contains

logging.basicConfig(level=logging.DEBUG)


class PlaylistTestCase(TestCase):

    @patch('uuid.uuid4')
    def setUp(self, patched_uuid):
        logging.debug('Run test: ' + str(self._testMethodName))
        self.post, self.get, self.patch, self.delete = get_rest_methods(self.client)
        self.request = get_request()
        self.maxDiff = None

        self.post("/api/artist", {'name': 'test_artist'})
        self.post("/api/artist", {'name': 'test_artist_2'})
        register_provider(PROVIDER_KEY, TestProvider())
        patched_uuid.return_value = 'fileId'
        self.post("/api/track", {'providerKey': PROVIDER_KEY, 'fileId': 'fileId', 'artists': [1]})
        patched_uuid.return_value = 'fileId_2'
        self.post("/api/track", {'providerKey': PROVIDER_KEY, 'fileId': 'fileId_2', 'artists': [2]})

        self.post("/api/playlist", {'name': 'playlist', 'tracks': [1, 2]})
        self.post("/api/playlist", {'name': 'playlist_2', 'tracks': [2]})

    @patch('melophony.views.utils.download_image')
    def test_create_playlist(self, patched_dl_image):
        # Missing parameters
        check_response(self, self.post("/api/playlist", {}), None, Status.BAD_REQUEST, 'Missing tracks field')
        check_response(self, self.post("/api/playlist", {'tracks': []}), None, Status.BAD_REQUEST, 'Unable to create playlist, missing name field')

        # Listed tracks do not exist
        playlist = {'name': 'playlist_3', 'tracks': [1, -2]}
        check_response(self, self.post("/api/playlist", playlist), None, Status.BAD_REQUEST, 'Track with id [-2] does not exist')

        # Success
        playlist = {'name': 'playlist_3', 'tracks': [2]}
        check_response(
            self,
            self.post("/api/playlist", playlist),
            get_expected_playlist(self, 3, 'playlist_3', tracks=[
                get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
            ]),
            Status.CREATED, Message.CREATED,
            strict_check=False
        )

    def test_get_playlist(self):
        # Unknown playlist
        check_response(self, self.get("/api/playlist/10"), None, Status.NOT_FOUND, Message.NOT_FOUND)

        # Success
        check_response(self, self.get("/api/playlist/1"), self._data_expected_for_first_playlist(), strict_check=False),

    def test_update_playlist(self):
        # Incorrect field provided, nothing changes
        check_response(
            self,
            self.patch("/api/playlist/1", {'hello': 'new_hello'}),
            self._data_expected_for_first_playlist(),
            Status.SUCCESS, 'Playlist updated successfully',
            strict_check=False
        )

        # Incorrect tracks list
        check_response(self, self.patch("/api/playlist/1", {'tracks': [2, -2]}, 1), None, Status.BAD_REQUEST, 'Track with id [-2] does not exist')
        # Check nothing has changed (artists must not change even if first id is valid)
        assert_dict_contains(self, get(Playlist, 1, formatted=True, foreign_keys=['tracks', 'artists', 'file']), self._data_expected_for_first_playlist())

        # Success
        check_response(
            self,
            self.patch("/api/playlist/1", {'name': 'new_name', 'tracks': [2]}, 1),
            get_expected_playlist(self, 1, 'new_name', tracks=[
                get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
            ]),
            message='Playlist updated successfully',
            strict_check=False
        )

    def test_delete_playlist(self):
        self.assertEqual(Playlist.objects.filter(pk=1).count(), 1)
        check_response(
            self,
            self.delete("/api/playlist/1"),
            get_expected_playlist(self, 1, 'playlist', tracks=[]),
            message='Playlist deleted', strict_check=False
        )
        self.assertEqual(Playlist.objects.filter(pk=1).count(), 0)

    def test_list_playlists(self):
        json_data = check_response(self, self.get("/api/playlist"), data_check=False)
        self.assertEqual(len(json_data), 2)
        assert_dict_contains(self, json_data[0], self._data_expected_for_first_playlist())
        assert_dict_contains(self, json_data[1], get_expected_playlist(self, 2, 'playlist_2', tracks=[
            get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
        ]))

        # List after deletion
        self.delete("/api/playlist/1")
        json_data = check_response(self, self.get("/api/playlist"), data_check=False)
        self.assertEqual(len(json_data), 1)
        assert_dict_contains(self, json_data[0], get_expected_playlist(self, 2, 'playlist_2', tracks=[
            get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
        ]))

    @patch('builtins.open', new_callable=mock_open, read_data='test_data')
    @patch('os.path.exists')
    def test_get_playlist_image(self, patched_exists, _):
        # Unable to find playlist
        check_response(self, self.get("/api/playlist/10/image"), None, Status.NOT_FOUND, 'Playlist not found')

        # Unable to find image
        patched_exists.return_value = False
        check_response(self, self.get("/api/playlist/1/image"), None, Status.BAD_REQUEST, 'Invalid path')

        # Success
        self.patch("/api/playlist/1", {'imageName': 'imageName'})
        patched_exists.return_value = True
        response = self.get("/api/playlist/1/image")
        self.assertEqual(response.content, b'test_data')

    def _data_expected_for_first_playlist(self):
        return get_expected_playlist(self, 1, 'playlist', tracks=[
            get_expected_track(self, 1, 1, filename_id='fileId', artists=[get_expected_artist(self, 1, 'test_artist')]),
            get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
        ])
