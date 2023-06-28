
import json
import logging

from django.db import models
from django.db.models.fields.related import ForeignKey
from django.db.models.query import QuerySet
from django.test import RequestFactory
from itertools import chain

from melophony.constants import Status, Message
from melophony.models import User
from melophony.track_providers import TrackProviderInterface


USER_NAME = 'test_user'
USER_FIRST_NAME = 'test_first_name'
USER_LAST_NAME = 'test_last_name'
USER_EMAIL = 'test_email'
USER_PASSWORD = 'test_password'
PROVIDER_KEY = 'test_provider'

ASSOCIATED_ARTIST = {'id': 1, 'name': 'test_artist', 'imageUrl': None, 'imageName': None, 'user': 1}

logging.basicConfig(level=logging.DEBUG)


def get_request():
    factory = RequestFactory()
    request = factory.get('')
    request.user = User.objects.get(id=1)
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


def get_rest_methods(client):
    User.objects.create_superuser(
        username=USER_NAME,
        email=USER_EMAIL,
        password=USER_PASSWORD,
        first_name=USER_FIRST_NAME,
        last_name=USER_LAST_NAME,
    )

    response = client.post("/api/login", {"userName": USER_NAME, "password": USER_PASSWORD}, content_type="application/json")
    json_data = json.loads(response.content)
    token = json_data["token"]

    def get(path, auth=True, **kwargs):
        return client.get(path, content_type="application/json", HTTP_AUTHORIZATION=token if auth else "", **kwargs)

    def post(path, json_body, auth=True, **kwargs):
        return client.post(path, json_body, content_type="application/json", HTTP_AUTHORIZATION=token if auth else "", **kwargs)

    def patch(path, json_body, auth=True, **kwargs):
        return client.patch(path, json_body, content_type="application/json", HTTP_AUTHORIZATION=token if auth else "", **kwargs)

    def delete(path, auth=True, **kwargs):
        return client.delete(path, content_type="application/json", HTTP_AUTHORIZATION=token if auth else "", **kwargs)

    return post, get, patch, delete


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


# filters is a list of keys to keep in the current object
# foreign_keys is a list of keys associated to foreign objects that should be returned with the current object
# foreign_filters is a dict which keys must match foreign_keys and which values are a list of keys to keep in the foreign object
def model_to_dict(instance, filters=None, foreign_keys=[], foreign_filters={}):
    data = {}
    if instance is not None:
        opts = instance._meta
        for f in chain(opts.concrete_fields, opts.private_fields):
            if filters is None or f.name in filters:
                if isinstance(f, ForeignKey) and f.name in foreign_keys:
                    data[f.name] = model_to_dict(getattr(instance, f.name), foreign_filters[f.name] if f.name in foreign_filters else None, foreign_keys)
                else:
                    data[f.name] = f.value_from_object(instance)
        for f in opts.many_to_many:
            if filters is None or f.name in filters:
                data[f.name] = [model_to_dict(i, foreign_filters[f.name] if f.name in foreign_filters else None, foreign_keys) if f.name in foreign_keys else i.id for i in f.value_from_object(instance)]
    return data


def db_format(data, filters=None, foreign_keys=[], foreign_filters={}):
    if isinstance(data, QuerySet):
        if len(foreign_keys) > 0:
            return [model_to_dict(x, filters, foreign_keys, foreign_filters) for x in data]
        else:
            return [x for x in data.values()]
    elif isinstance(data, dict):
        return data
    elif isinstance(data, models.Model):
        return model_to_dict(data, filters, foreign_keys, foreign_filters)


def get(o_type, id, formatted=False, filters=None, foreign_keys=[], foreign_filters={}):
    try:
        obj = o_type.objects.get(pk=id)
        if formatted:
            return db_format(obj, filters, foreign_keys, foreign_filters)
        else:
            return obj
    except Exception:
        return None


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