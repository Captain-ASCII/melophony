
import logging
import os
import requests
import shutil
import uuid
import melophony

from pathlib import Path
from PIL import Image

from django.db.models.query import QuerySet
from django.db import models, transaction
from django.http import HttpResponse, JsonResponse

from melophony.utils import model_to_dict
from melophony.track_providers import get_provider


class Message:
    SUCCESS = "Success"
    CREATED = "Created"
    ERROR = "Error"
    NOT_FOUND = "Not Found"


class Status:
    SUCCESS = 200
    CREATED = 201
    NO_CONTENT = 204
    BAD_REQUEST = 400
    UNAUTHORIZED = 403
    NOT_FOUND = 404
    ERROR = 500


FILES_DIR = os.path.join(os.path.dirname(melophony.__file__), "files")
TRACKS_DIR = 'tracks'


# Response formatting

def db_format(data, filters=None, foreign_keys=[], foreign_filters={}):
    if isinstance(data, QuerySet):
        if len(foreign_keys) > 0:
            return [model_to_dict(x, filters, foreign_keys, foreign_filters) for x in data]
        else:
            return [x for x in data.values()]
    elif isinstance(data, dict):
        return data
    elif isinstance(data, models.Model):
        return model_to_dict(data, filters, foreign_keys, foreign_filters)


def response(data=None, status=Status.SUCCESS, err_status=Status.BAD_REQUEST, message=Message.SUCCESS, err_message=Message.ERROR, token=None):
    status = err_status if data is None and status is not Status.NO_CONTENT else status
    message = err_message if data is None and status is not Status.NO_CONTENT else message

    data = {'message': message, 'data': data}
    if token is not None:
        data['token'] = token

    r = JsonResponse(data)
    r.status_code = status

    return r


# DB utils methods

def act(action):
    try:
        with transaction.atomic():
            return action()
    except Exception as e:
        logging.error(str(e))
        return None


def create(o_type, obj, extra={}):
    merged = {**obj, **extra}
    return act(lambda: o_type.objects.create(**merged))


def get(o_type, id, formatted=False, filters=None, foreign_keys=[], foreign_filters={}):
    try:
        obj = o_type.objects.get(pk=id)
        if formatted:
            return db_format(obj, filters, foreign_keys, foreign_filters)
        else:
            return obj
    except Exception:
        return None


def get_all(o_type, formatted=False, filters={}, key_filters=None, foreign_keys=[], foreign_filters={}):
    try:
        objects = o_type.objects.all()
        if filters:
            objects = objects.filter(**filters)
        if formatted:
            return [db_format(o, key_filters, foreign_keys, foreign_filters) for o in objects]
        else:
            return objects
    except Exception:
        return None


def update(o_type, id, changes):
    def upd():
        obj = o_type.objects.filter(pk=id)
        obj.update(**changes)
        return obj.first()
    return act(upd)


def delete(o_type, id):
    obj = o_type.objects.get(pk=id)
    if obj is not None:
        if act(lambda: obj.delete()):
            return obj
    return None


def set_many_to_many(main_object_list, related_o_type, related_objects):
    try:
        with transaction.atomic():
            main_object_list.clear()
            if len(related_objects) == 0:
                return True

            for related_object_id in related_objects:
                if type(related_object_id) != int or get(related_o_type, related_object_id) is None:
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


def delete_associated_image(o_type, object_id):
    instance = o_type.objects.get(pk=object_id)
    if instance.imageName is not None and os.path.isfile(instance.imageName):
        os.remove(instance.imageName)


def download_image(directory, image_url):
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
            return response(status=Status.ERROR, err_message='Invalid path')

        image_path = get_file_path(directory, image_name)
        if os.path.exists(image_path):
            with open(image_path, 'rb') as f:
                ok_response = HttpResponse(f.read(), content_type='image/webp')
                ok_response['Cache-Control'] = 'max-age=31536000'
                return ok_response
        return response(status=Status.ERROR, err_message="Error opening image")
    except IOError:
        logging.error("Error while opening image: " + image_name)
        return response(status=Status.ERROR, err_message=Message.ERROR)


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