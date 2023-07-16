
import re

from rest_framework.negotiation import BaseContentNegotiation
from rest_framework.exceptions import NotAcceptable

class ImageNegotiation(BaseContentNegotiation):
    def select_parser(self, request, parsers):
        return None

    def select_renderer(self, request, renderers, format_suffix):
        if 'Accept' in request.headers and not re.search(r'(image/webp|\*/\*)', request.headers['Accept']):
            raise NotAcceptable()
        return (renderers[0], renderers[0].media_type)


class AudioFileNegotiation(BaseContentNegotiation):
    def select_parser(self, request, parsers):
        return None

    def select_renderer(self, request, renderers, format_suffix):
        if 'Accept' in request.headers and not re.search(r'(audio/x-m4a|\*/\*)', request.headers['Accept']):
            raise NotAcceptable()
        return (renderers[0], renderers[0].media_type)