
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


class Artist(models.Model):
    name = models.CharField(max_length=255, blank=False, default=None)
    imageUrl = models.CharField(max_length=512, null=True)
    imageName = models.CharField(max_length=128, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lastModification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.name} ({self.id})'


class File(models.Model):

    class FILE_STATE(models.TextChoices):
        INITIAL = 'INITIAL', _('INITIAL')
        UNAVAILABLE = 'UNAVAILABLE', _('UNAVAILABLE')
        AVAILABLE = 'AVAILABLE', _('AVAILABLE')
        ERROR = 'ERROR', _('ERROR')
        DOWNLOADING = 'DOWNLOADING', _('DOWNLOADING')

    fileId =  models.CharField(max_length=255, blank=False, default=None)
    state = models.CharField(max_length=50, choices=FILE_STATE.choices, default=FILE_STATE.INITIAL)


class Track(models.Model):
    title = models.CharField(max_length=255, blank=False, default=None)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    artists = models.ManyToManyField(Artist)
    creationDate = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField()
    startTime = models.IntegerField()
    endTime = models.IntegerField()
    lastPlay = models.DateTimeField(auto_now=True)
    playCount = models.IntegerField()
    rating = models.IntegerField()
    progress = models.IntegerField()
    lastModification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.title} ({self.id})'


class Playlist(models.Model):
    name = models.CharField(max_length=255, blank=False, default=None)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tracks = models.ManyToManyField(Track, through='melophony.PlaylistTrack')
    imageUrl = models.CharField(max_length=512, null=True)
    imageName = models.CharField(max_length=128, null=True)
    lastModification = models.DateTimeField(auto_now=True)


class PlaylistTrack(models.Model):
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    playlist = models.ForeignKey(Playlist, on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
