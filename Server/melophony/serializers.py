
from rest_framework import serializers

from melophony.models import Artist, File, Playlist, Track, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        extra_kwargs = {'id': {'read_only': True}}


class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'imageUrl', 'imageName', 'user']
        extra_kwargs = {'id': {'read_only': True}, 'user': {'read_only': True}}


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'fileId', 'state']
        extra_kwargs = {'id': {'read_only': True}, 'fileId': {'read_only': True}}


class TrackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Track
        fields = ['id', 'title', 'file', 'artists', 'creationDate', 'duration', 'startTime', 'endTime', 'lastPlay', 'playCount', 'rating', 'progress', 'user']
        extra_kwargs = {'id': {'read_only': True}, 'user': {'read_only': True}}


class PlaylistSerializer(serializers.ModelSerializer):

    class Meta:
        model = Playlist
        fields = ['id', 'name', 'tracks', 'imageUrl', 'imageName', 'user']
        extra_kwargs = {'id': {'read_only': True}, 'user': {'read_only': True}}


