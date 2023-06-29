
import jwt
import traceback

from django.conf import settings
from django.contrib.auth.models import User, AnonymousUser
from rest_framework import authentication

from melophony.apps import MelophonyConfig


ALLOWED_PATHS = [
    '/api/login',
    '/api/register',
]


ALLOWED_STARTING_WITH_PATHS = [
    '/admin',
    '/api-auth',
]


class JWTSimpleAuthentication(authentication.BaseAuthentication):
    def __is_in_allowed_paths(self, path):
        return path in ALLOWED_PATHS or (settings.DEBUG and any([path.startswith(allowed) for allowed in ALLOWED_STARTING_WITH_PATHS]))

    def authenticate(self, request):
        token = request.META.get('HTTP_AUTHORIZATION', None)
        if token is None or token == 'null':
            token = request.GET.get('jwt', None)

        if token is not None and token != 'null':
            try:
                user_jwt = jwt.decode(token, MelophonyConfig.jwt_secret, algorithms=["HS256"])
                if user_jwt is not None:
                    user = User.objects.get(id=user_jwt['user']['id'])
                    return (user, None)
            except Exception as e:
                traceback.print_exc()
        elif self.__is_in_allowed_paths(request.path):
            return (AnonymousUser(), None)

        return None