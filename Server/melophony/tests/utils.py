
import json
import logging

from django.test import RequestFactory

from melophony.models import User
from melophony.track_providers import TrackProviderInterface
from melophony.views.utils import Status, Message

USER_NAME = 'test_user'
USER_FIRST_NAME = 'test_first_name'
USER_LAST_NAME = 'test_last_name'
USER_EMAIL = 'test_email'
USER_PASSWORD = 'test_password'
PROVIDER_KEY = 'test_provider'

ASSOCIATED_ARTIST = {'id': 1, 'name': 'test_artist', 'imageUrl': None, 'imageName': None, 'user': 1}



def get_request():
    user = User.objects.create_user(
        username=USER_NAME,
        email=USER_EMAIL,
        password=USER_PASSWORD,
        first_name=USER_FIRST_NAME,
        last_name=USER_LAST_NAME,
    )
    factory = RequestFactory()
    request = factory.get('')
    request.user = user
    return request


def get_json_from_response(response):
    """Get the JSON body from the response"""
    try:
        json_response = json.loads(response.content)
        logging.debug(json_response)
        return json_response
    except Exception as e:
        logging.exception(e)
        return {}


def check_response(testcase, response, expected_data=None, status_code=Status.SUCCESS, message=Message.SUCCESS, data_check=True, strict_check=True):
    """Check that the response is correct and return the JSON data associated for more specific tests"""
    testcase.assertEqual(response.status_code, status_code)
    json_data = get_json_from_response(response)
    testcase.assertIsNotNone(json_data)
    testcase.assertEqual(json_data['message'], message)
    if data_check:
        if strict_check:
            testcase.assertEqual(json_data['data'], expected_data)
        else:
            # Only check if expected data is contained in the response (may contain more)
            assert_dict_contains(testcase, json_data['data'], expected_data)

    return json_data['data']


def assert_dict_contains(testcase, container, contained):
    if type(container) != dict or type(contained) != dict:
        testcase.assertEqual(container, contained)

    for key, value in contained.items():
        testcase.assertTrue(key in container, f'{key} is not in {container}' )
        if type(value) == list and type(container[key]) == list:
            for index in range(len(value)):
                assert_dict_contains(testcase, container[key][index], value[index])
        elif type(value) == dict:
            assert_dict_contains(testcase, container[key], value)
        else:
            testcase.assertEqual(value, container[key])


def get_expected_artist(testcase, artist_id, artist_name='test_name'):
    return {
        'id': artist_id,
        'name': artist_name,
        'imageUrl': None,
        'imageName': None,
        'user': testcase.request.user.id,
    }


def get_expected_track(testcase, track_id, file_id, title='test_title', filename_id='fileId', artists=[ASSOCIATED_ARTIST], duration=100):
        return {
            'id': track_id,
            'title': title,
            'artists': artists,
            'file': {'id': file_id, 'fileId': filename_id, 'state': 'INITIAL'},
            'duration': duration,
            'startTime': 0,
            'endTime': duration,
            'playCount': 0,
            'rating': 0,
            'progress': 0,
            'user': testcase.request.user.id
        }


def get_expected_playlist(testcase, playlist_id, playlist_name='test_name', tracks=[]):
    return {
        'id': playlist_id,
        'name': playlist_name,
        'imageUrl': None,
        'imageName': None,
        'tracks': tracks,
        'user': testcase.request.user.id,
    }


class TestProvider(TrackProviderInterface):
    def get_extra_track_info(self, track_request, data):
        return "test_title", 100

    def add_file(self, file_path, parameters, data):
        return True, 'File added successfully'