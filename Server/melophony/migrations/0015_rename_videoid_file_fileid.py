# Generated by Django 4.0.3 on 2023-05-29 15:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('melophony', '0014_alter_artist_user_alter_playlist_user_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='file',
            old_name='videoId',
            new_name='fileId',
        ),
    ]