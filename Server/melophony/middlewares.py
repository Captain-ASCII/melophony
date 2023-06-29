# coding=utf-8

import logging

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect


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

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = HttpResponse() if request.method == 'OPTIONS' else self.get_response(request)
        response['allow'] = ','.join(CORSMiddleware.ALLOWED_METHODS)
        response['Access-Control-Allow-Headers'] = "*"
        response['Access-Control-Allow-Origin'] = "*" if settings.DEBUG else "https://melophony.ddns.net"
        response['Access-Control-Allow-Methods'] = ','.join(CORSMiddleware.ALLOWED_METHODS)
        return response
