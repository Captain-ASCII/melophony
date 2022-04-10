import datetime
import jwt
import logging
import os
import requests
import shutil
import threading
import traceback
import uuid
import youtube_dl

from pathlib import Path
from PIL import Image
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import models
from django.db.models.query import QuerySet
from django.http import HttpResponse, JsonResponse

from .apps import MelophonyConfig
from .models import Artist, File, Track, Playlist, PlaylistTrack
from .utils import model_to_dict


logging.basicConfig(level=logging.INFO)

TRACKS = 'tracks'
ARTIST_IMAGES = 'artist_images'
PLAYLIST_IMAGES = 'playlist_images'

class Message:
    SUCCESS = "Success"
    CREATED = "Created"
    ERROR = "Error"


class Status:
    SUCCESS = 200
    CREATED = 201
    BAD_REQUEST = 400
    UNAUTHORIZED = 403
    NOT_FOUND = 404
    ERROR = 500


FILES_DIR = os.path.join(os.path.dirname(__file__), "files")


def _file_path(directory, name, extension=None):
    suffix = '.' + extension if extension is not None else ''
    return os.path.join(FILES_DIR, directory, name + suffix)


def _delete_associated_image(o_type, object_id):
    instance = o_type.objects.get(pk=object_id)
    if instance.imageName is not None and os.path.isfile(instance.imageName):
        os.remove(instance.imageName)


def _download_image(directory, image_url):
    image_name = str(uuid.uuid4()) + '.tmp'
    image_path = _file_path(directory, image_name)

    r = requests.get(image_url, stream=True)

    if r.status_code == 200:
        r.raw.decode_content = True

        with open(image_path, 'wb') as f:
            shutil.copyfileobj(r.raw, f)

        logging.info('Image successfully Downloaded, convert to webp: %s', image_name)
        return _convert_to_webp(image_path)
    else:
        logging.info('Image Couldn\'t be retrieved')
        return None


def _convert_to_webp(source_path):
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


def _get_image(directory, image_name):
    try:
        image_path = _file_path(directory, image_name)
        if os.path.exists(image_path):
            with open(image_path, 'rb') as f:
                ok_response = HttpResponse(f.read(), content_type='image/webp')
                ok_response['Cache-Control'] = 'max-age=31536000'
                return ok_response
        return response(status=Status.ERROR, message="Error opening image")
    except IOError:
        logging.error("Error while opening image: " + image_name)
        return response(status=Status.ERROR, message=Message.ERROR)


def format(data, filters=None, foreign_keys=[], foreign_filters={}):
    if isinstance(data, QuerySet):
        if len(foreign_keys) > 0:
            return [model_to_dict(x, filters, foreign_keys, foreign_filters) for x in data]
        else:
            return [x for x in data.values()]
    elif isinstance(data, dict):
        return data
    elif isinstance(data, models.Model):
        return model_to_dict(data, filters, foreign_keys, foreign_filters)


def response(data=None, status=Status.SUCCESS, message=None, token=None):
    data = {'message': message, 'data': data}
    if token is not None:
        data['token'] = token

    r = JsonResponse(data)
    r.status_code = status

    return r


def act(action):
    try:
        return action()
    except Exception as e:
        logging.error(str(e))
        return None


def create(o_type, obj, extra={}):
    merged = {**obj, **extra}
    return act(lambda: o_type.objects.create(**merged))


def get(o_type, id, filters=None, foreign_keys=[], foreign_filters={}):
    try:
        obj = o_type.objects.get(pk=id)
        return format(obj, filters, foreign_keys, foreign_filters)
    except Exception:
        return None


def get_all(o_type, filters={}, key_filters=None, foreign_keys=[], foreign_filters={}):
    try:
        objects = o_type.objects.all()
        if filters:
            objects = objects.filter(**filters)
        return [format(o, key_filters, foreign_keys, foreign_filters) for o in objects]
    except Exception:
        return None


def update(o_type, id, changes):
    def upd():
        obj = o_type.objects.filter(pk=id)
        obj.update(**changes)
        return obj.first()
    return act(upd)


def delete(o_type, id):
    return act(lambda: o_type.objects.filter(pk=id).delete())


def set_many_to_many(relation_array, objects):
    relation_array.clear()
    for o in objects:
        relation_array.add(o)


# Files

def _download_yt_file(video_id, force_download=False):
    file_path = _file_path(TRACKS, video_id, 'm4a')
    if force_download and os.path.exists(file_path):
        logging.info("Removing file: %s", file_path)
        os.remove(file_path)

    def download(video_id):
        ydl_opts = {
            'outtmpl': file_path,
            'format': 'bestaudio/best',
        }

        with youtube_dl.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f'http://www.youtube.com/watch?v={video_id}'])

    t = threading.Thread(target=download, args=(video_id,))
    t.start()

def _create_file(file):
    filtered_file = File.objects.filter(videoId=file['videoId'])
    if filtered_file.exists():
        return filtered_file.get()
    else:
        return File.objects.create(**file)


# Users

def _check_user_exists(username):
    try:
        User.objects.get(username=username) is not None
    except User.DoesNotExist:
        return None

    return username


def create_user(r, body):
    try:
        if _check_user_exists(body['userName']) is not None:
            return response(status=Status.BAD_REQUEST, message='Username already in use')

        user = User.objects.create_user(body['userName'], body['email'], body['password'])
        user.first_name = body['firstName']
        user.last_name = body['lastName']
        user.save()
        jwt_data = _generate_new_token(user)

        return response(status=Status.CREATED, token=jwt.encode(jwt_data, MelophonyConfig.jwt_secret, algorithm="HS256"))
    except Exception as e:
        traceback.print_exc()
        return response(status=Status.BAD_REQUEST, message='Something bad happened during registration, try again')

def _generate_new_token(user):
    expiration_date = int((datetime.datetime.now() + datetime.timedelta(days=7)).timestamp())
    return {'exp': expiration_date, 'user': {'id': user.id, 'firstName': user.first_name, 'lastName': user.last_name}}

def login(r, body):
    user = authenticate(username=body['userName'], password=body['password'])
    if user is not None:
        jwt_data = _generate_new_token(user)
        return response(message='Successfully authenticated', token=jwt.encode(jwt_data, MelophonyConfig.jwt_secret, algorithm="HS256"))
    else:
        return response(status=Status.UNAUTHORIZED, message='Invalid credentials')

def get_user(r):
    user = User.objects.get(pk=r.user.id)
    jwt_data = _generate_new_token(user)
    return response(
        {'userName': user.username, 'firstName': user.first_name, 'lastName': user.last_name},
        token=jwt.encode(jwt_data, MelophonyConfig.jwt_secret, algorithm="HS256")
    )

def update_user(r, user, user_id):
    return response(status=Status.ERROR, message="NOT IMPLEMENTED")

def delete_user(r, user_id):
    return response(delete(User, user_id))


# Artists

def create_artist(r, artist):
    return response(format(create(Artist, artist, {'user': r.user})), message=Message.CREATED, status=Status.CREATED)

def get_artist(r, artist_id):
    return response(get(Artist, artist_id))

def update_artist(r, artist, artist_id):
    if 'imageUrl' in artist:
        _delete_associated_image(Artist, artist_id)
        artist['imageName'] = _download_image(ARTIST_IMAGES, artist['imageUrl'])

    return response(format(update(Artist, artist_id, artist)), message='Artist updated successfully')

def delete_artist(r, artist_id):
    return response(delete(Artist, artist_id))

def list_artists(r):
    return response(get_all(Artist, filters={'user': r.user.id}))

def find_artist(r, body, artistName):
    return response()

def get_artist_image(r, image_name):
    return _get_image(ARTIST_IMAGES, image_name)


# Tracks

def _get_track_info(video_id):
    with youtube_dl.YoutubeDL() as ydl:
        result = ydl.extract_info(f'http://www.youtube.com/watch?v={video_id}', download=False)
        return (result['id'], result['title'], result['duration']) if result else (None, None, None)


def create_track(r, track):
    video_id, title, duration = _get_track_info(track['videoId'])
    if video_id is not None:
        file = _create_file({'videoId': video_id})
        if os.path.exists(_file_path(TRACKS, video_id, 'm4a')):
            logging.info('File already downloaded')
        else:
            _download_yt_file(video_id)

        artists = []
        if 'artists' in track and track['artists']:
            artists = track['artists']
        elif 'artistName' in track and track['artistName'] != '':
            artist = create(Artist, {'name': track['artistName'], 'user': r.user})
            artists = [artist]

        if 'title' in track:
            title = track['title']

        track = create(Track, {
            'title': title,
            'file': file,
            'duration': duration,
            'startTime': 0,
            'endTime': duration,
            'playCount': 0,
            'rating': 0,
            'progress': 0,
            'user': r.user
        })

        if len(artists) > 0:
            _set_artists(track.id, artists)

        return response(format(track, foreign_keys=['artists', 'file']), message=Message.CREATED, status=Status.CREATED)
    else:
        return response(status=Status.ERROR, message='Could not get track information')

def get_track(r, track_id):
    return response(get(Track, track_id, recursive=True))

def _set_artists(track_id, artists):
    track = Track.objects.get(pk=track_id)
    track.artists.clear()
    for artist in artists:
        track.artists.add(artist)

def update_track(r, changes, track_id):
    if 'artists' in changes:
        try:
            _set_artists(track_id, changes['artists'])
            del changes['artists']
        except Exception as e:
            return response(status=Status.ERROR, message=f'Error while updating artists: {e}')

    return response(format(update(Track, track_id, changes)), message='Track updated successfully')

def delete_track(r, track_id):
    return response(delete(Track, track_id))

def list_tracks(r):
    return response(get_all(Track, filters={'user': r.user.id}, foreign_keys=['artists', 'file']))

def find_track(r, body, track):
    return response()


# Playlists

def create_playlist(r, provided_playlist):
    if 'imageUrl' in provided_playlist and provided_playlist['imageUrl'] != '':
        provided_playlist['imageName'] = _download_image(PLAYLIST_IMAGES, provided_playlist['imageUrl'])

    tracks = provided_playlist['tracks']
    del provided_playlist['tracks']

    playlist = Playlist.objects.create(**provided_playlist, user=r.user)
    for index, track in enumerate(tracks):
        PlaylistTrack.objects.create(track_id=track, playlist=playlist, order=index)

    return response(format(playlist, foreign_keys=['tracks', 'artists', 'file']), message=Message.SUCCESS, status=Status.CREATED)

def get_playlist(r, playlist_id):
    return response(get(Playlist, playlist_id))

def update_playlist(r, modifications, playlist_id):
    if 'imageUrl' in modifications:
        _delete_associated_image(Playlist, playlist_id)
        modifications['imageName'] = _download_image(PLAYLIST_IMAGES, modifications['imageUrl'])

    if 'tracks' in modifications:
        tracks = modifications['tracks']
        del modifications['tracks']

        PlaylistTrack.objects.filter(playlist_id=playlist_id).delete()
        for index, track in enumerate(tracks):
            PlaylistTrack.objects.create(track_id=track, playlist_id=playlist_id, order=index)

    playlist = update(Playlist, playlist_id, modifications)

    return response(format(playlist), message='Playlist updated successfully')

def delete_playlist(r, playlist_id):
    return response(delete(Playlist, playlist_id))

def list_playlists(r):
    return response(get_all(Playlist, filters={'user': r.user.id}, foreign_keys=['tracks', 'artists', 'file']))

def find_playlist(r, body, playlist):
    return response()

def get_playlist_image(r, image_name):
    return _get_image(PLAYLIST_IMAGES, image_name)


# Files

def play_file(r, file_name):
    file_path = _file_path(TRACKS, file_name, 'm4a')
    if os.path.exists(file_path):
        f = open(file_path, "rb")
        http_response = HttpResponse()
        http_response.write(f.read())
        http_response['Content-Type'] = 'audio/mp4'
        http_response['Accept-Ranges'] = 'bytes'
        http_response['Content-Length'] = os.path.getsize(file_path)
        return http_response
    else:
        return response(message='File does not exist', status=Status.ERROR)

def download_again(r, parameters, file_name):
    force_download = parameters['forceDownload'] if 'forceDownload' in parameters else False
    _download_yt_file(file_name, force_download)
    return response(message='Download started', status=Status.SUCCESS)