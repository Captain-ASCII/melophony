
from melophony.utils import get_configuration

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView

from melophony.views.utils import response


class KeysView(APIView):

    def __init__(self, **kwargs):
        super(KeysView, self).__init__(**kwargs)

    responses = {
        200: openapi.Response('Keys result', openapi.Schema(type=openapi.TYPE_OBJECT, description="Keys for client restricted access to external API", properties={
            'googleImageSecretKey': openapi.Schema(type=openapi.TYPE_STRING),
            'googleImageCx': openapi.Schema(type=openapi.TYPE_STRING)
        }))
    }

    @swagger_auto_schema(operation_id='get_keys', responses=responses)
    def get(self, request):
        return response({
            'googleImageSecretKey': get_configuration('googleImageSecretKey', ''),
            'googleImageCx': get_configuration('googleImageCx', '')
        })