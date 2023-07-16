# coding=utf-8

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect

from melophony.utils import get_configuration

HOSTNAME = get_configuration('hostname', 'melophony.ddns.net')


class RedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api') or settings.DEBUG:
            return self.get_response(request)
        else:
            hostname = request.get_host().split(':')[0]
            port = ':1958' if settings.DEBUG else ''
            return redirect(f'{request.scheme}://{hostname}{port}/public/index.html')


class CORSMiddleware:
    ALLOWED_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
    ALLOWED_RESPONSE_HEADERS = ['Message', 'Token']

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = HttpResponse() if request.method == 'OPTIONS' else self.get_response(request)
        response['allow'] = ','.join(CORSMiddleware.ALLOWED_METHODS)
        response['Access-Control-Allow-Headers'] = "*"
        response['Access-Control-Allow-Origin'] = "*" if settings.DEBUG else f"https://{HOSTNAME}"
        response['Access-Control-Allow-Methods'] = ','.join(CORSMiddleware.ALLOWED_METHODS)
        response['Access-Control-Expose-Headers'] = ','.join(CORSMiddleware.ALLOWED_RESPONSE_HEADERS)
        return response
