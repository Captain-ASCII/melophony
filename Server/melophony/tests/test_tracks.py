
import logging

from datetime import datetime
from django.test import TestCase
from mock import MagicMock, patch

from melophony.models import Track
from melophony.track_providers import register_provider, unregister_provider
from melophony.views.artist_views import create_artist
from melophony.views.track_views import create_track, get_track, update_track, delete_track, list_tracks
from melophony.views.utils import Status, Message, get

from melophony.tests.utils import get_request, check_response, PROVIDER_KEY, TestProvider, get_expected_track, assert_dict_contains

logging.basicConfig(level=logging.DEBUG)


class TrackTestCase(TestCase):

    @patch('uuid.uuid4')
    def setUp(self, patched_uuid):
        logging.debug('Run test: ' + str(self._testMethodName))
        self.maxDiff = None
        self.request = get_request()

        create_artist(self.request, {'name': 'test_artist'})
        register_provider(PROVIDER_KEY, TestProvider())
        # Both tracks use the same file and the same artists
        patched_uuid.return_value = 'fileId'
        create_track(self.request, {'providerKey': PROVIDER_KEY, 'artists': [1]})
        create_track(self.request, {'providerKey': PROVIDER_KEY, 'artists': [1]})
        unregister_provider(PROVIDER_KEY)

    @patch('uuid.uuid4')
    def test_create_track(self, patched_uuid):
        # Missing provider key
        check_response(
            self, create_track(self.request, {}),
            None, Status.BAD_REQUEST, 'providerKey must be provided to identify track provider'
        )
        # No provider found for key
        check_response(
            self, create_track(self.request, {'providerKey': PROVIDER_KEY}),
            None, Status.NOT_FOUND, 'No provider found for key'
        )

        # Error while adding file
        test_provider = TestProvider()
        register_provider(PROVIDER_KEY, test_provider)
        parameters = {'providerKey': PROVIDER_KEY, 'some_parameter': 'test'}
        error_message = 'Error while adding file'
        test_provider.add_file = MagicMock(return_value=(False, error_message))
        patched_uuid.return_value = 'test_fileId'
        parameters['title'] = 'provided_title'
        check_response(self, create_track(self.request, parameters), None, Status.BAD_REQUEST, error_message)

        # Success
        register_provider(PROVIDER_KEY, TestProvider())
        expected_track = get_expected_track(self, 3, 2, artists=[], filename_id='test_fileId')
        check_response(self, create_track(self.request, parameters), expected_track, Status.CREATED, Message.CREATED, strict_check=False),

        # Check artists are set and title provided by user is used (if not overridden by extra info)
        test_provider = TestProvider()
        test_provider.get_extra_track_info = MagicMock(return_value=(None, 100))
        register_provider(PROVIDER_KEY, test_provider)
        parameters['artists'] = [1]
        check_response(
            self,
            create_track(self.request, parameters),
            get_expected_track(self, 4, 2, 'provided_title', 'test_fileId'),
            Status.CREATED, Message.CREATED,
            strict_check=False
        )

    def test_get_track(self):
        # Unknown track
        check_response(self, get_track(self.request, -1), None, Status.NOT_FOUND, Message.NOT_FOUND)

        # Success
        check_response(self, get_track(self.request, 1), get_expected_track(self, 1, 1, filename_id='fileId'), strict_check=False),

    def test_update_track(self):
        # Incorrect field provided
        check_response(self, update_track(self.request, {'doNotExist': 'new_DoNotExist'}, 1), None, Status.BAD_REQUEST, Message.ERROR)

        # Incorrect artists list
        create_artist(self.request, {'name': 'test_artist_2'})
        check_response(self, update_track(self.request, {'artists': [2, -2]}, 1), None, Status.ERROR, 'Error while updating track artists')
        # Check nothing has changed (artists must not change even if first id is valid)
        assert_dict_contains(self, get(Track, 1, formatted=True, foreign_keys=['artists', 'file']), get_expected_track(self, 1, 1))

        # Success
        check_response(
            self,
            update_track(self.request, {'title': 'new_title', 'artists': []}, 1),
            get_expected_track(self, 1, 1, 'new_title', artists=[]),
            message='Track updated successfully',
            strict_check=False
        )

    def test_delete_track(self):
        self.assertEqual(Track.objects.filter(pk=1).count(), 1)
        # Track is deleted, it does not have an ID no more, the artists link is deleted also (empty list)
        check_response(self, delete_track(self.request, 1), get_expected_track(self, None, 1, artists=[]), message='Track deleted', strict_check=False)
        self.assertEqual(Track.objects.filter(pk=1).count(), 0)

    def test_list_tracks(self):
        json_data = check_response(self, list_tracks(self.request), data_check=False)
        self.assertEqual(len(json_data), 2)
        assert_dict_contains(self, json_data[0], get_expected_track(self, 1, 1))
        assert_dict_contains(self, json_data[1], get_expected_track(self, 2, 1))

        # List after deletion
        delete_track(self.request, 1)
        json_data = check_response(self, list_tracks(self.request), data_check=False)
        self.assertEqual(len(json_data), 1)
        assert_dict_contains(self, json_data[0], get_expected_track(self, 2, 1))

    def _check_track(self, json_data, expected_track):
        self._assert_date_and_set_in_expected(json_data, 'creationDate', expected_track)
        self._assert_date_and_set_in_expected(json_data, 'lastPlay', expected_track)
        self.assertEqual(json_data, expected_track)

    def _assert_date_and_set_in_expected(self, json_data, key, expected):
        self.assertTrue(key in json_data)
        expected[key] = json_data[key]