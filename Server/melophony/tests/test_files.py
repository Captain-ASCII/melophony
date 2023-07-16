
import logging
import os
import unittest

from django.test import TestCase
from mock import patch, mock_open, MagicMock
from unittest import skip

from melophony.constants import Status, Message
from melophony.models import File
from melophony.track_providers import TrackProviderInterface, register_provider
from melophony.views.file_views import add_file, create_file_object
from melophony.views.utils import get_file_path, TRACKS_DIR

from melophony.tests.utils import get_rest_methods, get_request, check_response, PROVIDER_KEY

logging.basicConfig(level=logging.DEBUG)

TEST_DATA = 'test_data'


class FileTestCase(TestCase):

    def setUp(self):
        logging.debug('Run test: ' + str(self._testMethodName))
        self.post, self.get, self.patch, self.delete = get_rest_methods(self.client)
        self.request = get_request()
        register_provider(PROVIDER_KEY, TestProvider())
        add_file(self.request, 'fileId', {'providerKey': PROVIDER_KEY, 'some_parameter': 'test'}, None)
        create_file_object({'fileId': 'fileId'})

    def tearDown(self):
        test_file = get_file_path(TRACKS_DIR, 'fileId', 'm4a')
        if os.path.exists(test_file):
            os.remove(test_file)

    @patch('melophony.views.file_views._get_range')
    @patch('builtins.open', new_callable=mock_open, read_data=TEST_DATA)
    @patch('os.path.exists')
    def test_play_file(self, patched_exists, _, patched_range):
        patched_exists.return_value = True
        # Full content
        patched_range.return_value = (0, len(TEST_DATA), False, len(TEST_DATA))
        self._check_file_response(self.get("/api/file/1?fileFormat=raw"), False, 0, len(TEST_DATA), len(TEST_DATA))
        # Partial content
        patched_range.return_value = (0, 4, True, len(TEST_DATA))
        self._check_file_response(self.get("/api/file/1?fileFormat=raw"), True, 0, 4, len(TEST_DATA))

        # No file
        patched_exists.return_value = False
        check_response(self, self.get("/api/file/2"), None, Status.NOT_FOUND, Message.NOT_FOUND)

    def _check_file_response(self, response, is_partial, start, end, full_length):
        self.assertEqual(response['Accept-Ranges'], 'bytes')
        self.assertEqual(response['Content-Length'], str(end - start))
        self.assertEqual(response['Content-Type'], 'audio/x-m4a')
        self.assertEqual(response.status_code, 206 if is_partial else 200)
        self.assertEqual(response.content, bytes(TEST_DATA[:end], 'utf-8'))
        if is_partial:
            self.assertEqual(response['Content-Range'], f'bytes {start}-{end-1}/{full_length}')

    @skip("Needs an update on how forcing a file to be added can be done (front-end + back-end)")
    def test_force_add_file(self):
        # Missing provider key
        check_response(
            self, add_file(self.request, 'fileId', {}, None),
            None, Status.BAD_REQUEST, 'providerKey must be provided to identify track provider'
        )

        # No provider found for key
        check_response(
            self, add_file(self.request, 'fileId', {'providerKey': 'provider_that_does_not_exist'}, None),
            None, Status.NOT_FOUND, 'No provider found for key'
        )

        # Unable to create file
        test_provider = TestProvider()
        register_provider(PROVIDER_KEY, test_provider)
        error_message = 'Error while adding file'
        test_provider.add_file = MagicMock()
        test_provider.add_file.return_value = False, error_message
        check_response(
            self, add_file(self.request, 'fileId', {'providerKey': PROVIDER_KEY, 'some_parameter': 'test'}, None),
            None, Status.BAD_REQUEST, error_message
        )

        # Success
        register_provider(PROVIDER_KEY, TestProvider())
        check_response(
            self, add_file(self.request, 'fileId', {'providerKey': PROVIDER_KEY, 'some_parameter': 'test'}, None),
            None, Status.NO_CONTENT, 'File added successfully'
        )

        # Try to add file already present
        check_response(
            self, add_file(self.request, 'fileId', {'providerKey': PROVIDER_KEY, 'some_parameter': 'test'}, None),
            None, Status.NO_CONTENT, 'File already exists'
        )

    def test_create_file(self):
        self.assertEqual(File.objects.all().count(), 1)
        created_file = create_file_object({'fileId': 'test_file_id'})
        self.assertEqual(created_file.fileId, 'test_file_id')
        self.assertEqual(File.objects.all().count(), 2)

        # Try to re-create already existing file
        created_file = create_file_object({'fileId': 'test_file_id'})
        self.assertEqual(created_file.fileId, 'test_file_id')
        self.assertEqual(File.objects.all().count(), 2)


class TestProvider(TrackProviderInterface):
    def add_file(self, file_path, parameters, data):
        testcase = unittest.TestCase()
        testcase.assertTrue('some_parameter' in parameters)
        logging.info(f"Created file at {file_path}")
        with open(file_path, 'w') as f:
            f.write('file added')
        return True, 'File added successfully'
