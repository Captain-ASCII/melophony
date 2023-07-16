
import logging
import os

from django.http import HttpResponse
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets
from rest_framework.decorators import action

from melophony.constants import Status
from melophony.models import File
from melophony.negotiation import AudioFileNegotiation
from melophony.serializers import FileSerializer

from melophony.permissions import IsOwnerOfInstance
from melophony.views.utils import response, get_file_path, TRACKS_DIR, get_required_provider, add_file_with_provider


RANGE_SEPARATOR = ', '
PACKET_SIZE = 200000

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [IsOwnerOfInstance]

    def get_queryset(self):
        return File.objects.filter(track__user=self.request.user)

    @swagger_auto_schema(
        manual_parameters=[openapi.Parameter('full', openapi.IN_QUERY, description="Indicates if the full track should be returned", type=openapi.TYPE_BOOLEAN)],
        responses={"200": openapi.Schema(type=openapi.TYPE_FILE)}
    )
    @action(detail=True, methods=['GET'], content_negotiation_class=AudioFileNegotiation)
    def download(self, request, pk):
        full_requested = request.GET.get('full', False)
        file = self.get_object()
        file_path = get_file_path(TRACKS_DIR, file.fileId, 'm4a')
        if os.path.exists(file_path):
            with open(file_path, "rb") as f:
                start, end, partial, full_length = _get_range(request, file_path, full_requested != 'true')
                http_response = HttpResponse()
                if partial:
                    http_response.status_code = 206
                    http_response['Content-Range'] = f'bytes {start}-{end-1}/{full_length}'
                http_response['Accept-Ranges'] = 'bytes'
                http_response['Content-Length'] = end - start
                http_response['Content-Type'] = 'audio/x-m4a'
                http_response.write(f.read()[start:end])
                return http_response
        else:
            return response(err_message='File does not exist', err_status=Status.NOT_FOUND)


def _get_range(request, file_path, use_partial):
    file_size = os.path.getsize(file_path)
    start = 0
    end = file_size

    if 'Range' in request.headers and request.headers['Range'].startswith('bytes='):
        range_header = request.headers['Range'][6:]
        if RANGE_SEPARATOR in range_header:
            return response(message='Multiple range not handled', status=Status.BAD_REQUEST)

        [requested_start, requested_end] = range_header.split('-')
        start = file_size - requested_end if requested_start == '' else int(requested_start)
        end = file_size if requested_end == '' else int(requested_end)

    end = min(file_size, start + PACKET_SIZE) if use_partial else file_size

    return start, end, (end - start) != (file_size), file_size


def add_file(r, file_id, parameters, data):
    provider, message, status = get_required_provider(parameters)
    logging.info(f'{provider}, {message}, {status}')
    if provider is None:
        return response(err_status=status, err_message=message)

    success, message, status = add_file_with_provider(provider, file_id, parameters, data)
    if not success:
        return response(err_status=status, err_message=message)

    return response(status=status, message=message)


def create_file_object(file):
    filtered_file = File.objects.filter(fileId=file['fileId'])
    if filtered_file.exists():
        return filtered_file.get()
    else:
        return File.objects.create(**file)