# coding=utf-8
import jwt
import traceback

from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import redirect
from django.conf import settings


from .apps import MelophonyConfig
from .urls import ALLOWED_PATHS, ALLOWED_STARTING_WITH_PATHS
from .views import Status, response

class RedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api') or (settings.DEBUG and request.path.startswith('/admin')):
            return self.get_response(request)
        else:
            hostname = request.get_host().split(':')[0]
            port = ':1958' if settings.DEBUG else ''
            return redirect(f'{request.scheme}://{hostname}{port}/public/index.html')


class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __is_in_allowed_paths(self, path):
        return path in ALLOWED_PATHS or any([path.startswith(allowed) for allowed in ALLOWED_STARTING_WITH_PATHS])

    def __call__(self, request):
        if self.__is_in_allowed_paths(request.path):
            return self.get_response(request)
        else:
            token = request.META.get('HTTP_AUTHORIZATION', None)
            if token is None or token == 'null':
                token = request.GET.get('jwt', None)

            if token is not None and token != 'null':
                try:
                    user_jwt = jwt.decode(token, MelophonyConfig.jwt_secret, algorithms=["HS256"])
                    user = User.objects.get(id=user_jwt['user']['id'])
                    if user_jwt is not None:
                        request.user = user
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
