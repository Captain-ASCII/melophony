
from rest_framework import serializers

from melophony.models import Artist, File, Playlist, Track, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'url', 'username', 'first_name', 'last_name', 'email']


class ArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ['id', 'name', 'imageUrl', 'imageName', 'user']
        extra_kwargs = {'user': {'read_only': True}}


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'fileId', 'state']


class TrackSerializer(serializers.ModelSerializer):
    artists = ArtistSerializer(many=True, read_only=True)
    file = FileSerializer(read_only=True)

    class Meta:
        model = Track
        fields = ['id', 'title', 'file', 'artists', 'creationDate', 'duration', 'startTime', 'endTime', 'lastPlay', 'playCount', 'rating', 'progress', 'user']
        extra_kwargs = {'user': {'read_only': True}}


class PlaylistSerializer(serializers.ModelSerializer):
    tracks = TrackSerializer(many=True, read_only=True)

    class Meta:
        model = Playlist
        fields = ['id', 'name', 'tracks', 'imageUrl', 'imageName', 'user']
        extra_kwargs = {'user': {'read_only': True}}


