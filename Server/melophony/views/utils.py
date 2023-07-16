
import logging
import melophony
import os
import requests
import shutil
import uuid

from pathlib import Path
from PIL import Image

from django.db import transaction
from django.http import HttpResponse, JsonResponse

from melophony.constants import Status, Message
from melophony.track_providers import get_provider

from rest_framework import viewsets
from rest_framework.response import Response


FILES_DIR = os.path.join(os.path.dirname(melophony.__file__), "files")
TRACKS_DIR = 'tracks'


# Response formatting


def perform_update(viewset, message, instance, data):
    serializer = viewset.get_serializer(instance, data=data, partial=True)
    serializer.is_valid(raise_exception=True)
    viewset.perform_update(serializer)
    return response(serializer.data, message=message)


def response(data=None, status=Status.SUCCESS, err_status=Status.BAD_REQUEST, message=Message.SUCCESS, err_message=Message.ERROR, token=None):
    status = err_status if data is None and status is not Status.NO_CONTENT else status
    message = err_message if data is None and status is not Status.NO_CONTENT else message

    r = JsonResponse(data if data else {})
    r.status_code = status
    r.headers['Message'] = message

    if token is not None:
        r.headers['Token'] = token

    return r


# Providers related methods

def get_required_provider(parameters):
    """
    Request to add a file through the provider associated with providerKey in parameters.
    :param parameters: A dictionary containing the parameters of the request
    :returns: A 3-tuple with the provider found or None, a result message and a status that can be returned to front-end
    """
    if 'providerKey' not in parameters:
        return None, 'providerKey must be provided to identify track provider', Status.BAD_REQUEST

    provider = get_provider(parameters['providerKey'])

    if provider is None:
        return None, 'No provider found for key', Status.NOT_FOUND

    return provider, "Provider found", Status.SUCCESS


def add_file_with_provider(provider, file_id, parameters, data):
    """
    Request to add a file through the provider associated with providerKey in parameters.
    :param file_id: The file identifier that will be used to check or create the track file
    :param parameters: A dictionary containing the parameters of the request
    :param data: A raw bytes object containing the track file data
    :returns: A 3-tuple with a boolean indicating the result, a result message associated, and a more accurate status that can be returned to front-end
    """
    file_path = get_file_path(TRACKS_DIR, file_id, 'm4a')
    if os.path.exists(file_path):
        logging.info('File already downloaded')
        return True, 'File already exists', Status.NO_CONTENT

    success, message = provider.add_file(file_path, parameters, data)
    return success, message, Status.NO_CONTENT if success else Status.BAD_REQUEST


# DB utils methods

def get(o_type, object_id, user):
    try:
        return o_type.objects.get(pk=object_id, user=user)
    except Exception:
        return None


def set_many_to_many(main_object_list, related_o_type, related_objects, user):
    try:
        with transaction.atomic():
            main_object_list.clear()
            if len(related_objects) == 0:
                return True

            for related_object_id in related_objects:
                if type(related_object_id) != int or get(related_o_type, related_object_id, user) is None:
                    raise Exception(str(related_o_type.__name__) + ' with id [' + str(related_object_id) + '] does not exist')
                main_object_list.add(related_object_id)
            return True
    except Exception as e:
        logging.error(e)
        return False


# File management


def get_file_path(directory, name, extension=None):
    suffix = '.' + extension if extension is not None else ''
    return os.path.join(FILES_DIR, directory, name + suffix)


def delete_associated_image(instance):
    if instance.imageName is not None and os.path.isfile(instance.imageName):
        os.remove(instance.imageName)


def replace_image(instance, directory, modifications):
    imageUrl = modifications.get('imageUrl', None)
    if imageUrl is not None:
        delete_associated_image(instance)
        modifications['imageName'] = download_image(directory, imageUrl)
    return modifications


def download_image(directory, image_url):
    if image_url is None or not image_url.startswith('http'):
        logging.error('URL is not usable for download, skipping...')
        return None

    image_name = str(uuid.uuid4()) + '.tmp'
    image_path = get_file_path(directory, image_name)

    r = requests.get(image_url, stream=True)

    if r.status_code == 200:
        r.raw.decode_content = True

        with open(image_path, 'wb') as f:
            shutil.copyfileobj(r.raw, f)

        logging.info('Image successfully Downloaded, convert to webp: %s', image_name)
        return convert_to_webp(image_path)
    else:
        logging.info('Image Couldn\'t be retrieved')
        return None


def convert_to_webp(source_path):
    source = Path(source_path)
    try:
        destination = source.with_suffix(".webp")
        image = Image.open(source)
        image.save(destination, format="webp")
        logging.info('Image successfully converted to WebP: %s', source)
        os.remove(source_path)
        return destination.name
    except Exception as e:
        print("Unable to convert image: " + str(source) + ' ' + str(e))
        return source


def get_image(directory, image_name):
    try:
        if image_name is None:
            return response(err_status=Status.NO_CONTENT, err_message='Invalid path')

        image_path = get_file_path(directory, image_name)
        if os.path.exists(image_path):
            with open(image_path, 'rb') as f:
                ok_response = HttpResponse(f.read(), content_type='image/webp')
                ok_response['Cache-Control'] = 'max-age=31536000'
                return ok_response
        return response(err_status=Status.NOT_FOUND, err_message="Image not found")
    except IOError:
        logging.error("Error while opening image: " + image_name)
        return response(err_status=Status.ERROR, err_message=Message.ERROR)