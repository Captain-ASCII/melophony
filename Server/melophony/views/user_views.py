
import json
import jwt
import logging
import traceback

from datetime import datetime, timedelta
from django.contrib.auth import authenticate
from rest_framework import viewsets
from rest_framework.decorators import action

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
    user_classes = True

    def create(self, request, *args, **kwargs):
        try:
            body = json.loads(request.body)
            if _check_user_exists(body['username']) is not None:
                return response(status=Status.BAD_REQUEST, err_message='Username already in use')

            user = User.objects.create_user(body['username'], body['email'], body['password'])
            user.first_name = body['first_name']
            user.last_name = body['last_name']
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
        jwt_data = _generate_new_token(user, request.token_data)
        return response(_user_data(user), token=jwt.encode(jwt_data, MelophonyConfig.jwt_secret, algorithm="HS256"))

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if 'password' in request.data:
            user.set_password(request.data['password'])
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']

        user.save()
        return response(_user_data(user), message="User updated successfully")

    @action(detail=False, methods=["POST"])
    def login(self, request):
        try:
            body = json.loads(request.body)
            user = authenticate(username=body['username'], password=body['password'])
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
            return response(err_status=Status.BAD_REQUEST, err_message='Missing mandatory parameters: [username, password]')


def _check_user_exists(username):
    try:
        User.objects.get(username=username) is not None
    except User.DoesNotExist:
        return None

    return username


def _generate_new_token(user, token_data=None):
    if token_data is None or (token_data is not None and datetime.fromtimestamp(token_data['exp']) < (datetime.now() + timedelta(days=7))):
        expiration_date = int((datetime.now() + timedelta(days=30)).timestamp())
        return {'exp': expiration_date, 'user': {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name}}

    return token_data



def _user_data(user):
    return {'id': user.id, 'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name}