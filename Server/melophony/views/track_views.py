
import logging
import uuid


from melophony.models import Artist, Track
from melophony.track_providers import get_provider
from melophony.views.file_views import create_file_object
from melophony.views.utils import response, db_format, Message, Status, create, get, get_all, update, delete, set_many_to_many, get_file_path, TRACKS_DIR


def create_track(r, track_request, data):
    if 'providerKey' not in track_request:
        return response(err_status=Status.BAD_REQUEST, err_message='providerKey must be provided to identify track provider')

    provider = get_provider(track_request['providerKey'])

    if provider is None:
        return response(err_status=Status.NOT_FOUND, err_message='No provider found for key')

    file_id = str(uuid.uuid4())
    success, message = provider.add_file(get_file_path(TRACKS_DIR, file_id, 'm4a'), track_request, data)
    if not success:
        return response(err_status=Status.ERROR, err_message=message)

    file = create_file_object({'fileId': file_id})

    track_info = {
        'title': track_request['title'] if 'title' in track_request else 'Default title',
        'file': file,
        'duration': track_request['duration'] if 'duration' in track_request else 0,
        'startTime': 0,
        'endTime': track_request['duration'] if 'duration' in track_request else 0,
        'playCount': 0,
        'rating': 0,
        'progress': 0,
        'user': r.user
    }

    title, duration = provider.get_extra_track_info(track_request, data)
    if title is not None:
        track_info['title'] = title
    if duration is not None:
        track_info['duration'] = duration
        track_info['endTime'] = duration

    artists = []
    if 'artists' in track_request and track_request['artists']:
        artists = track_request['artists']
    elif 'artistName' in track_request and track_request['artistName'] != '':
        artist = create(Artist, {'name': track_request['artistName'], 'user': r.user})
        artists = [artist.id]

    track = create(Track, track_info)

    if len(artists) > 0:
        set_many_to_many(track.artists, Artist, artists)

    return response(db_format(track, foreign_keys=['artists', 'file']), message=Message.CREATED, status=Status.CREATED)

def get_track(r, track_id):
    return response(get(Track, track_id, formatted=True, foreign_keys=['artists', 'file']), err_status=Status.NOT_FOUND, err_message=Message.NOT_FOUND)

def update_track(r, changes, track_id):
    if 'artists' in changes:
        try:
            track = Track.objects.get(pk=track_id)
            if track is None:
                return response(err_status=Status.NOT_FOUND, err_message='No track found for provided id')
            if not set_many_to_many(track.artists, Artist, changes['artists']):
                return response(err_status=Status.ERROR, err_message='Error while updating track artists')
            del changes['artists']
        except Exception as e:
            logging.error(e)
            return response(err_status=Status.ERROR, err_message='Error while updating track artists')

    return response(db_format(update(Track, track_id, changes), foreign_keys=['artists', 'file']), message='Track updated successfully')

def delete_track(r, track_id):
    return response(db_format(delete(Track, track_id), foreign_keys=['artists', 'file']), message='Track deleted')

def list_tracks(r):
    return response(get_all(Track, formatted=True, filters={'user': r.user.id}, foreign_keys=['artists', 'file']))