from django.contrib import admin

from .models import Album, Artist, Track, Playlist, PlaylistTrack, File

admin.site.register(Album)
admin.site.register(Artist)
admin.site.register(Track)
admin.site.register(Playlist)
admin.site.register(PlaylistTrack)
admin.site.register(File)