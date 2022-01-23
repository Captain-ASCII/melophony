import datetime
import os
import logging
import jwt
import requests
import shutil
import threading
import uuid
import youtube_dl

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import models
from django.db.models.query import QuerySet
from django.http import HttpResponse, JsonResponse

from .apps import MelophonyConfig
from .models import Album, Artist, File, Track, Playlist, PlaylistTrack
from .utils import model_to_dict


logging.basicConfig(level=logging.INFO)

TRACKS = 'tracks'
ARTIST_IMAGES = 'artist_images'

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


def response(data=None, status=Status.SUCCESS, message=Message.SUCCESS, token=None):
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


def create(o_type, obj):
    return act(lambda: o_type.objects.create(**obj))


def get(o_type, id, filters=None, foreign_keys=[], foreign_filters={}):
    try:
        obj = o_type.objects.get(pk=id)
        return format(obj, filters, foreign_keys, foreign_filters)
    except Exception:
        return None


def get_all(o_type, filters=None, foreign_keys=[], foreign_filters={}):
    try:
        objects = o_type.objects.all()
        return [format(o, filters, foreign_keys, foreign_filters) for o in objects]
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

def _download_yt_file(video_id):
    def download(video_id):
        ydl_opts = {
            'outtmpl': _file_path(TRACKS, video_id, 'm4a'),
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

def create_user(r, body):
    try:
        user = User.objects.create_user(body['userName'], body['email'], body['password'])
        user.first_name = body['firstName']
        user.last_name = body['lastName']
        user.save()
        return response(status=Status.CREATED)
    except:
        return response(status=Status.BAD_REQUEST, message='Something bad happened during registration, try again')

def login(r, body):
    user = authenticate(username=body['email'], password=body['password'])
    if user is not None:
        expiration_date = int((datetime.datetime.now() + datetime.timedelta(days=1)).timestamp())
        jwt_data = {'exp': expiration_date, 'user': {'id': user.id, 'firstName': user.first_name, 'lastName': user.last_name}}
        return response(message='Successfully authenticated', token=jwt.encode(jwt_data, MelophonyConfig.jwt_secret, algorithm="HS256"))
    else:
        return response(status=Status.UNAUTHORIZED, message='Invalid credentials')

def get_user(r):
    user = get(User, r.user.id, ['username', 'first_name', 'last_name'])
    return response({'userName': user['username'], 'firstName': user['first_name'], 'lastName': user['last_name']})

def update_user(r, user, user_id):
    return response(status=Status.ERROR, message="NOT IMPLEMENTED")

def delete_user(r, user_id):
    return response(delete(User, user_id))


# Artists

def create_artist(r, artist):
    return response(format(create(Artist, artist)), message=Message.CREATED, status=Status.CREATED)

def get_artist(r, artist_id):
    return get(Artist, artist_id)

def update_artist(r, artist, artist_id):
    if 'imageUrl' in artist:
        db_artist = Artist.objects.get(pk=artist_id)
        if db_artist.imageName is not None and os.path.isfile(db_artist.imageName):
            os.remove(db_artist.imageName)

        image_url = artist['imageUrl']
        extension = image_url.rsplit('/')[-1].split('?')[0].rsplit('.')[-1]
        image_name = str(uuid.uuid4()) + '.' + extension
        image_path = _file_path(ARTIST_IMAGES, image_name)

        r = requests.get(image_url, stream=True)

        if r.status_code == 200:
            r.raw.decode_content = True

            with open(image_path, 'wb') as f:
                shutil.copyfileobj(r.raw, f)

            artist['imageName'] = image_name
            logging.info('Image sucessfully Downloaded: ', image_name)
        else:
            logging.info('Image Couldn\'t be retreived')

    return response(format(update(Artist, artist_id, artist)))

def delete_artist(r, artist_id):
    return response(delete(Artist, artist_id))

def list_artists(r):
    return response(format(Artist.objects.all()))

def find_artist(r, body, artistName):
    return response()

def get_artist_image(r, image_name):
    try:
        with open(_file_path(ARTIST_IMAGES, image_name), 'rb') as f:
            return HttpResponse(f.read(), content_type='image/jpeg')
    except IOError:
        logging.error("Error while opening image: " + image_name)


# Albums

def create_album(r, album):
    return response(format(create(Album, album)), message=Message.CREATED, status=Status.CREATED)

def get_album(r, album_id):
    return get(Album, album_id)

def update_album(r, album, album_id):
    return response(format(update(Album, album_id, album)))

def delete_album(r, album_id):
    return response(delete(Album, album_id))

def list_albums(r):
    return response(format(Album.objects.all()))

def find_album(r, body, artistName):
    return response()


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

        return response(format(create(Track, {
            'title': title,
            'album': None,
            'file': file,
            'duration': duration,
            'startTime': 0,
            'endTime': duration,
            'playCount': 0,
            'rating': 0,
            'progress': 0,
        }), message=Message.CREATED, status=Status.CREATED))
    else:
        return response(status=Status.ERROR, message='Could not get track information')

def get_track(r, track_id):
    return get(Track, track_id, recursive=True)

def update_track(r, changes, track_id):
    if 'artists' in changes:
        try:
            track = Track.objects.get(pk=track_id)
            track.artists.clear()
            for artist in changes['artists']:
                track.artists.add(artist)
            del changes['artists']
        except Exception as e:
            return response(status=Status.ERROR, message=f'Error while updating artists: {e}')

    return response(format(update(Track, track_id, changes)))

def delete_track(r, track_id):
    return response(delete(Track, track_id))

def list_tracks(r):
    return response(get_all(Track, foreign_keys=['artists', 'file']))

def find_track(r, body, track):
    return response()


# Playlists

def create_playlist(r, provided_playlist):
    playlist = Playlist.objects.create(user=r.user, name=provided_playlist['name'])
    for index, track in enumerate(provided_playlist['tracks']):
        PlaylistTrack.objects.create(track_id=track, playlist=playlist, order=index)

    return response(format(playlist), message=Message.SUCCESS, status=Status.CREATED)

def get_playlist(r, playlist_id):
    return get(Playlist, playlist_id)

def update_playlist(r, modifications, playlist_id):
    tracks = modifications['tracks']
    del modifications['tracks']
    playlist = update(Playlist, playlist_id, modifications)

    PlaylistTrack.objects.filter(playlist_id=playlist.id).delete()
    for index, track in enumerate(tracks):
        PlaylistTrack.objects.create(track_id=track, playlist_id=playlist_id, order=index)

    return response(format(playlist))

def delete_playlist(r, playlist_id):
    return response(delete(Playlist, playlist_id))

def list_playlists(r):
    return response(get_all(Playlist, foreign_keys=['tracks', 'artists', 'file']))

def find_playlist(r, body, playlist):
    return response()


# Files

def play_file(r, file_name):
    file_path = _file_path(TRACKS, file_name, 'm4a')
    f = open(file_path, "rb")
    response = HttpResponse()
    response.write(f.read())
    response['Content-Type'] = 'audio/mp4'
    response['Accept-Ranges'] = 'bytes'
    response['Content-Length'] = os.path.getsize(file_path)
    return response
