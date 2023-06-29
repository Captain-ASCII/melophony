
import datetime
import json
import jwt
import logging
import traceback

from django.contrib.auth import authenticate
from rest_framework import viewsets

from melophony.apps import MelophonyConfig
from melophony.constants import Status, Message
from melophony.models import User
from melophony.permissions import UserPermissions
from melophony.serializers import UserSerializer

from melophony.views.utils import response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [UserPermissions]

    def create(self, request, *args, **kwargs):
        try:
            body = json.loads(request.body)
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

    def retrieve(self, request, pk):
        user = self.get_object()
        jwt_data = _generate_new_token(user)
        return response(_user_data(user), token=jwt.encode(jwt_data, MelophonyConfig.jwt_secret, algorithm="HS256"))

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if 'password' in request.data:
            user.set_password(request.data['password'])
        if 'firstName' in request.data:
            user.first_name = request.data['firstName']
        if 'lastName' in request.data:
            user.last_name = request.data['lastName']

        user.save()
        return response(_user_data(user), message="User updated successfully")

    def destroy(self, request, pk):
        user = self.get_object()
        user.delete()
        return response(_user_data(user), message='User deleted')


def _check_user_exists(username):
    try:
        User.objects.get(username=username) is not None
    except User.DoesNotExist:
        return None

    return username


def _generate_new_token(user):
    expiration_date = int((datetime.datetime.now() + datetime.timedelta(days=7)).timestamp())
    return {'exp': expiration_date, 'user': {'id': user.id, 'firstName': user.first_name, 'lastName': user.last_name}}


def login(request):
    try:
        body = json.loads(request.body)
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

def _user_data(user):
    return {'id': user.id, 'userName': user.username, 'firstName': user.first_name, 'lastName': user.last_name}