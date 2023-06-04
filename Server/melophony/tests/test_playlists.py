
import logging

from django.db import transaction
from django.test import TestCase
from mock import patch, mock_open

from melophony.models import Playlist
from melophony.track_providers import register_provider, unregister_provider
from melophony.views.artist_views import create_artist
from melophony.views.playlist_views import create_playlist, get_playlist, update_playlist, delete_playlist, list_playlists, get_playlist_image
from melophony.views.track_views import create_track
from melophony.views.utils import Status, Message, get

from melophony.tests.utils import get_request, check_response, PROVIDER_KEY, TestProvider, get_expected_playlist, get_expected_track, get_expected_artist, assert_dict_contains

logging.basicConfig(level=logging.DEBUG)


class PlaylistTestCase(TestCase):

    def setUp(self):
        logging.debug('Run test: ' + str(self._testMethodName))
        self.maxDiff = None
        self.request = get_request()

        create_artist(self.request, {'name': 'test_artist'})
        create_artist(self.request, {'name': 'test_artist_2'})
        register_provider(PROVIDER_KEY, TestProvider())
        create_track(self.request, {'providerKey': PROVIDER_KEY, 'fileId': 'fileId', 'artists': [1]})
        create_track(self.request, {'providerKey': PROVIDER_KEY, 'fileId': 'fileId_2', 'artists': [2]})

        create_playlist(self.request, {'name': 'playlist', 'tracks': [1, 2]})
        create_playlist(self.request, {'name': 'playlist_2', 'tracks': [2]})

    @patch('melophony.views.utils.download_image')
    def test_create_playlist(self, patched_dl_image):
        # Missing parameters
        check_response(self, create_playlist(self.request, {}), None, Status.BAD_REQUEST, 'Missing tracks field')
        check_response(self, create_playlist(self.request, {'tracks': []}), None, Status.BAD_REQUEST, 'Unable to create playlist, missing name field')

        # Listed tracks do not exist
        playlist = {'name': 'playlist_3', 'tracks': [1, -2]}
        check_response(self, create_playlist(self.request, playlist), None, Status.BAD_REQUEST, 'Track with id [-2] does not exist')

        # Success
        playlist = {'name': 'playlist_3', 'tracks': [2]}
        check_response(
            self,
            create_playlist(self.request, playlist),
            get_expected_playlist(self, 3, 'playlist_3', tracks=[
                get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
            ]),
            Status.CREATED, Message.CREATED,
            strict_check=False
        )

    def test_get_playlist(self):
        # Unknown playlist
        check_response(self, get_playlist(self.request, -1), None, Status.NOT_FOUND, Message.NOT_FOUND)

        # Success
        check_response(self, get_playlist(self.request, 1), self._data_expected_for_first_playlist(), strict_check=False),

    def test_update_playlist(self):
        # Incorrect field provided
        check_response(self, update_playlist(self.request, {'hello': 'new_hello'}, 1), None, Status.BAD_REQUEST, Message.ERROR)

        # Incorrect tracks list
        check_response(self, update_playlist(self.request, {'tracks': [2, -2]}, 1), None, Status.BAD_REQUEST, 'Track with id [-2] does not exist')

        # Check nothing has changed (artists must not change even if first id is valid)
        assert_dict_contains(self, get(Playlist, 1, formatted=True, foreign_keys=['tracks', 'artists', 'file']), self._data_expected_for_first_playlist())

        # Success
        check_response(
            self,
            update_playlist(self.request, {'name': 'new_name', 'tracks': [2]}, 1),
            get_expected_playlist(self, 1, 'new_name', tracks=[
                get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
            ]),
            message='Playlist updated successfully',
            strict_check=False
        )

    def test_delete_playlist(self):
        self.assertEqual(Playlist.objects.filter(pk=1).count(), 1)
        # Playlist is deleted, it does not have an ID no more, the tracks link is also deleted (empty tracks array)
        check_response(
            self,
            delete_playlist(self.request, 1),
            get_expected_playlist(self, None, 'playlist', tracks=[]),
            message='Playlist deleted', strict_check=False
        )
        self.assertEqual(Playlist.objects.filter(pk=1).count(), 0)

    def test_list_playlists(self):
        json_data = check_response(self, list_playlists(self.request), data_check=False)
        self.assertEqual(len(json_data), 2)
        assert_dict_contains(self, json_data[0], self._data_expected_for_first_playlist())
        assert_dict_contains(self, json_data[1], get_expected_playlist(self, 2, 'playlist_2', tracks=[
            get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
        ]))

        # List after deletion
        delete_playlist(self.request, 1)
        json_data = check_response(self, list_playlists(self.request), data_check=False)
        self.assertEqual(len(json_data), 1)
        assert_dict_contains(self, json_data[0], get_expected_playlist(self, 2, 'playlist_2', tracks=[
            get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
        ]))

    @patch('builtins.open', new_callable=mock_open, read_data='test_data')
    @patch('os.path.exists')
    def test_get_playlist_image(self, patched_exists, _):
        # Unable to find playlist
        check_response(self, get_playlist_image(self.request, -1), None, Status.NOT_FOUND, 'Playlist not found')

        # Unable to find image
        patched_exists.return_value = False
        check_response(self, get_playlist_image(self.request, 1), None, Status.BAD_REQUEST, 'Invalid path')

        # Success
        update_playlist(self.request, {'imageName': 'imageName'}, 1)
        patched_exists.return_value = True
        response = get_playlist_image(self.request, 1)
        self.assertEqual(response.content, b'test_data')

    def _data_expected_for_first_playlist(self):
        return get_expected_playlist(self, 1, 'playlist', tracks=[
            get_expected_track(self, 1, 1, filename_id='fileId', artists=[get_expected_artist(self, 1, 'test_artist')]),
            get_expected_track(self, 2, 2, filename_id='fileId_2', artists=[get_expected_artist(self, 2, 'test_artist_2')])
        ])
