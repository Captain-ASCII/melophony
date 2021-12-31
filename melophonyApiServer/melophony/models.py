from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _


class Album(models.Model):
    name = models.CharField(max_length=255, blank=False, default=None)


class Artist(models.Model):
    name = models.CharField(max_length=255, blank=False, default=None)

    def __str__(self):
        return f'{self.name} ({self.id})'


class File(models.Model):

    class FILE_STATE(models.TextChoices):
        INITIAL = 'INITIAL', _('INITIAL')
        UNAVAILABLE = 'UNAVAILABLE', _('UNAVAILABLE')
        AVAILABLE = 'AVAILABLE', _('AVAILABLE')
        ERROR = 'ERROR', _('ERROR')
        DOWNLOADING = 'DOWNLOADING', _('DOWNLOADING')

    videoId =  models.CharField(max_length=255, blank=False, default=None)
    state = models.CharField(max_length=50, choices=FILE_STATE.choices, default=FILE_STATE.INITIAL)


class Track(models.Model):
    title = models.CharField(max_length=255, blank=False, default=None)
    album = models.ForeignKey(Album, on_delete=models.DO_NOTHING, null=True)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    artists = models.ManyToManyField(Artist)
    creationDate = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField()
    startTime = models.IntegerField()
    endTime = models.IntegerField()
    lastPlay = models.DateTimeField(auto_now=True)
    playCount = models.IntegerField()
    rating = models.IntegerField()
    progress = models.IntegerField()

    def __str__(self):
        return f'{self.title} ({self.id})'


class Playlist(models.Model):
    name = models.CharField(max_length=255, blank=False, default=None)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tracks = models.ManyToManyField(Track)
