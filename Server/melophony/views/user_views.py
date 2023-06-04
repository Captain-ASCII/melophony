
import datetime
import jwt
import traceback
import logging

from django.contrib.auth import authenticate

from melophony.apps import MelophonyConfig
from melophony.models import User

from melophony.views.utils import response, Message, Status, update, delete


def _check_user_exists(username):
    try:
        User.objects.get(username=username) is not None
    except User.DoesNotExist:
        return None

    return username

def create_user(r, body):
    try:
        if _check_user_exists(body['userName']) is not None:
            return response(status=Status.BAD_REQUEST, err_message='Username already in use')

        user = User.objects.create_user(body['userName'], body['email'], body['password'])
        user.first_name = body['firstName']
        user.last_name = body['lastName']
        user.save()
        jwt_data = _generate_new_token(user)

        return response(
            _user_data(user),
            status=Status.CREATED, message=Message.CREATED,
            token=jwt.encode(jwt_data, MelophonyConfig.jwt_secret, algorithm="HS256")
        )
    except Exception as e:
        traceback.print_exc()
        return response(status=Status.BAD_REQUEST, err_message='Something bad happened during registration, try again')

def _generate_new_token(user):
    expiration_date = int((datetime.datetime.now() + datetime.timedelta(days=7)).timestamp())
    return {'exp': expiration_date, 'user': {'id': user.id, 'firstName': user.first_name, 'lastName': user.last_name}}

def login(r, body):
    try:
        user = authenticate(username=body['userName'], password=body['password'])
        if user is not None:
            jwt_data = _generate_new_token(user)
            return response(
                _user_data(user),
                message='Successfully authenticated',
                token=jwt.encode(jwt_data, MelophonyConfig.jwt_secret, algorithm="HS256")
            )
        else:
            return response(err_status=Status.UNAUTHORIZED, err_message='Invalid credentials')
    except Exception as e:
        logging.exception(e)
        return response(err_status=Status.BAD_REQUEST, err_message='Missing mandatory parameters: [userName, password]')

def get_user(r):
    user = User.objects.get(pk=r.user.id)
    jwt_data = _generate_new_token(user)
    return response(_user_data(user), token=jwt.encode(jwt_data, MelophonyConfig.jwt_secret, algorithm="HS256"))

def update_user(r, user):
    current_user = User.objects.get(pk=r.user.id)
    if 'password' in user:
        current_user.set_password(user['password'])
    if 'firstName' in user:
        current_user.first_name = user['firstName']
    if 'lastName' in user:
        current_user.last_name = user['lastName']

    current_user.save()
    return response(_user_data(current_user), message="User updated successfully")

def delete_user(r):
    return response(_user_data(delete(User, r.user.id)), message='User deleted')

def _user_data(user):
    return {'userName': user.username, 'firstName': user.first_name, 'lastName': user.last_name}