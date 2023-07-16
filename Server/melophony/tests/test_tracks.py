
import logging

from django.test import TestCase
from mock import MagicMock, patch

from melophony.constants import Status, Message
from melophony.models import Track
from melophony.track_providers import register_provider, unregister_provider

from melophony.tests.utils import get_rest_methods, get_request, check_response, PROVIDER_KEY, TestProvider, get_expected_track, assert_dict_contains, get

logging.basicConfig(level=logging.INFO)


class TrackTestCase(TestCase):

    @patch('uuid.uuid4')
    def setUp(self, patched_uuid):
        logging.debug('Run test: ' + str(self._testMethodName))
        self.post, self.get, self.patch, self.delete = get_rest_methods(self.client)
        self.request = get_request()
        self.maxDiff = None

        self.post("/api/artist", {'name': 'test_artist'})
        register_provider(PROVIDER_KEY, TestProvider())
        # Both tracks use the same file and the same artists
        patched_uuid.return_value = 'fileId'
        self.post("/api/track", {'providerKey': PROVIDER_KEY, 'artists': [1]})
        self.post("/api/track", {'providerKey': PROVIDER_KEY, 'artists': [1]})
        unregister_provider(PROVIDER_KEY)

    @patch('uuid.uuid4')
    def test_create_track(self, patched_uuid):
        # Missing provider key
        check_response(
            self, self.post("/api/track", {}),
            None, Status.BAD_REQUEST, 'providerKey must be provided to identify track provider'
        )
        # No provider found for key
        check_response(
            self, self.post("/api/track", {'providerKey': PROVIDER_KEY}),
            None, Status.NOT_FOUND, 'No provider found for key'
        )

        # Error while adding file
        test_provider = TestProvider()
        register_provider(PROVIDER_KEY, test_provider)
        parameters = {'providerKey': PROVIDER_KEY, 'some_parameter': 'test', 'title': 'provided_title'}
        error_message = 'Error while adding file'
        test_provider.add_file = MagicMock(return_value=(False, error_message))
        patched_uuid.return_value = 'test_fileId'
        check_response(self, self.post("/api/track", parameters), None, Status.BAD_REQUEST, error_message)

        # Success
        patched_uuid.return_value = 'test_fileId'
        register_provider(PROVIDER_KEY, TestProvider())
        parameters = {'providerKey': PROVIDER_KEY, 'title': 'provided_title', 'artistName': 'provided_name'}
        expected_track = get_expected_track(self, 3, 2, artists=[], filename_id='test_fileId')
        check_response(self, self.post("/api/track", parameters), expected_track, Status.CREATED, Message.CREATED, strict_check=False),

        # Check artists are set and title provided by user is used (if not overridden by extra info)
        test_provider = TestProvider()
        test_provider.get_extra_track_info = MagicMock(return_value=(None, 100))
        register_provider(PROVIDER_KEY, test_provider)
        parameters['artists'] = [1]
        check_response(
            self,
            self.post("/api/track", parameters),
            get_expected_track(self, 4, 2, 'provided_title', 'test_fileId'),
            Status.CREATED, Message.CREATED,
            strict_check=False
        )

    def test_get_track(self):
        # Unknown track
        check_response(self, self.get("/api/track/10"), None, Status.NOT_FOUND, Message.NOT_FOUND)

        # Success
        check_response(self, self.get("/api/track/1"), get_expected_track(self, 1, 1, filename_id='fileId'), strict_check=False),

    def test_update_track(self):
        # Incorrect field provided, nothing changes
        check_response(
            self,
            self.patch("/api/track/1", {'doNotExist': 'new_DoNotExist'}),
            get_expected_track(self, 1, 1, filename_id='fileId'),
            Status.SUCCESS, 'Track updated successfully',
            strict_check=False
        )

        # Incorrect artists list
        self.post("/api/artist", {'name': 'test_artist_2'})
        check_response(self, self.patch("/api/track/1", {'artists': [2, -2]}), None, Status.ERROR, 'Error while updating track artists')
        # Check nothing has changed (artists must not change even if first id is valid)
        assert_dict_contains(self, get(Track, 1, formatted=True, foreign_keys=['artists', 'file']), get_expected_track(self, 1, 1))

        # Success
        check_response(
            self,
            self.patch("/api/track/1", {'title': 'new_title', 'artists': []}),
            get_expected_track(self, 1, 1, 'new_title', artists=[]),
            message='Track updated successfully',
            strict_check=False
        )

    def test_delete_track(self):
        self.assertEqual(Track.objects.filter(pk=1).count(), 1)
        # No deletion since track id does not exist
        check_response(self, self.delete("/api/track/10"), None, status_code=Status.NOT_FOUND, message=Message.NOT_FOUND)
        self.assertEqual(Track.objects.filter(pk=1).count(), 1)

        check_response(self, self.delete("/api/track/1"), get_expected_track(self, 1, 1, artists=[]), message='Track deleted', strict_check=False)
        self.assertEqual(Track.objects.filter(pk=1).count(), 0)

    def test_list_tracks(self):
        json_data = check_response(self, self.get("/api/track"), data_check=False)
        self.assertEqual(len(json_data), 2)
        assert_dict_contains(self, json_data[0], get_expected_track(self, 1, 1))
        assert_dict_contains(self, json_data[1], get_expected_track(self, 2, 1))

        # List after deletion
        self.delete("/api/track/1")
        json_data = check_response(self, self.get("/api/track"), data_check=False)
        self.assertEqual(len(json_data), 1)
        assert_dict_contains(self, json_data[0], get_expected_track(self, 2, 1))

    def _check_track(self, json_data, expected_track):
        self._assert_date_and_set_in_expected(json_data, 'creationDate', expected_track)
        self._assert_date_and_set_in_expected(json_data, 'lastPlay', expected_track)
        self.assertEqual(json_data, expected_track)

    def _assert_date_and_set_in_expected(self, json_data, key, expected):
        self.assertTrue(key in json_data)
        expected[key] = json_data[key]