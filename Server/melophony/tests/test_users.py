
import logging

from django.test import TestCase

from melophony.models import User
from melophony.views.user_views import create_user, login, get_user, update_user, delete_user
from melophony.views.utils import Status, Message

from melophony.tests.utils import get_request, check_response, USER_NAME, USER_FIRST_NAME, USER_LAST_NAME, USER_EMAIL, USER_PASSWORD

logging.basicConfig(level=logging.DEBUG)


class UserTestCase(TestCase):

    def setUp(self):
        logging.debug('Run test: ' + str(self._testMethodName))
        self.request = get_request()

    def test_create_user(self):
        # Missing parameters
        check_response(self, create_user(self.request, {}), None, Status.BAD_REQUEST, 'Something bad happened during registration, try again')

        # Success
        user = {'userName': 'test', 'email': 'hello@example.com', 'password': 'test', 'firstName': 'first', 'lastName': 'last'}
        expected_user = {'userName': 'test', 'firstName': 'first', 'lastName': 'last'}
        check_response(self, create_user(self.request, user), expected_user, Status.CREATED, Message.CREATED)

        # Try to add user with same user name
        check_response(self, create_user(self.request, user), None, Status.BAD_REQUEST, 'Username already in use')

    def test_login(self):
        # Missing parameters
        check_response(self, login(self.request, {}), None, Status.BAD_REQUEST, 'Missing mandatory parameters: [userName, password]')

        # Invalid credentials
        user_request = {'userName': 'not_existing', 'password': 'password'}
        check_response(self, login(self.request, user_request), None, Status.UNAUTHORIZED, 'Invalid credentials')

        user_request = {'userName': USER_NAME, 'password': 'password2'}
        check_response(self, login(self.request, user_request), None, Status.UNAUTHORIZED, 'Invalid credentials')

        # Login OK
        user_request = {'userName': USER_NAME, 'password': USER_PASSWORD}
        check_response(self, login(self.request, user_request), self._get_user_data(), Status.SUCCESS, 'Successfully authenticated')

    def test_get_user(self):
        check_response(self, get_user(self.request), self._get_user_data())

    def test_update_user(self):
        check_response(self, get_user(self.request), self._get_user_data())
        self._check_db_user(USER_NAME, USER_PASSWORD, USER_EMAIL, USER_FIRST_NAME, USER_LAST_NAME)

        user_modifications = {
            'userName': 'cannot_change',
            'password': 'new_pass',
            'email': 'cannot_change',
            'firstName': 'new_first',
            'lastName': 'new_last'
        }
        new_user_data = self._get_user_data(USER_NAME, 'new_first', 'new_last')
        check_response(self, update_user(self.request, user_modifications), new_user_data, message='User updated successfully')

        check_response(self, get_user(self.request), new_user_data)
        self._check_db_user(USER_NAME, 'new_pass', USER_EMAIL, 'new_first', 'new_last')

    def test_delete_user(self):
        # Delete current user
        self.assertEqual(User.objects.all().count(), 1)
        check_response(self, delete_user(self.request), self._get_user_data(), message='User deleted')
        self.assertEqual(User.objects.all().count(), 0)

    def _check_db_user(self, username, password, email, first_name, last_name):
        user = User.objects.get(username=username)
        self.assertEqual(user.username, username)
        self.assertTrue(user.check_password(password))
        self.assertEqual(user.email, email)
        self.assertEqual(user.first_name, first_name)
        self.assertEqual(user.last_name, last_name)

    def _get_user_data(self, username=USER_NAME, first_name=USER_FIRST_NAME, last_name=USER_LAST_NAME):
        return {'userName': username, 'firstName': first_name, 'lastName': last_name}
