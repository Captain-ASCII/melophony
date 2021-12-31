# coding=utf-8
import jwt
import traceback

from django.http import HttpResponse
from django.utils.functional import SimpleLazyObject
from django.contrib.auth.models import User
from django.conf import LazySettings
from django.contrib.auth.middleware import get_user

from .apps import MelophonyConfig
from .views import Status, response

settings = LazySettings()


class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == '/login' or request.path == '/register' or request.path == '/favicon.ico' or request.path.startswith('/admin'):
            return self.get_response(request)
        else:
            user_jwt = get_user(request)
            if user_jwt.is_authenticated:
                return self.get_response(request)

            token = request.META.get('HTTP_AUTHORIZATION', None)
            if token is None or token == 'null':
                token = request.GET.get('jwt', None)

            if token is not None and token != 'null':
                try:
                    user_jwt = jwt.decode(token, MelophonyConfig.jwt_secret, algorithms=["HS256"])
                    user_jwt = User.objects.get(id=user_jwt['user']['id'])
                    if user_jwt is not None:
                        request.user_id = user_jwt.id
                        return self.get_response(request)
                except Exception as e:
                    traceback.print_exc()

            return response(status=Status.UNAUTHORIZED, message="You are not authorized to access this content")


class CORSMiddleware:
    ALLOWED_METHODS = ['get', 'post', 'put', 'delete', 'options']

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = HttpResponse() if request.method == 'OPTIONS' else self.get_response(request)
        response['allow'] = ','.join(CORSMiddleware.ALLOWED_METHODS)
        response['Access-Control-Allow-Headers'] = "*"
        response['Access-Control-Allow-Origin'] = "*"
        response['Access-Control-Allow-Methods'] = ','.join(CORSMiddleware.ALLOWED_METHODS)
        return response
