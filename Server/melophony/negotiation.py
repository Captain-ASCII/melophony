
from rest_framework.negotiation import BaseContentNegotiation
from rest_framework.exceptions import NotAcceptable

class ImageNegotiation(BaseContentNegotiation):
    def select_parser(self, request, parsers):
        return None

    def select_renderer(self, request, renderers, format_suffix):
        if 'Accept' in request.headers and request.headers['Accept'] != 'image/webp' and request.headers['Accept'] != '*/*':
            raise NotAcceptable()
        return (renderers[0], renderers[0].media_type)