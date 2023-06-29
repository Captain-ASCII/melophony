
from rest_framework.renderers import JSONRenderer

from melophony.constants import get_associated_message


class ApiRenderer(JSONRenderer):

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context['response']
        status_code = response.status_code

        response = {
            "data": data,
            "message": response.message if hasattr(response, 'message') else get_associated_message(status_code)
        }

        if not str(status_code).startswith('2'):
            response["data"] = None

        return super(ApiRenderer, self).render(response, accepted_media_type, renderer_context)
