# Generated by Django 4.0 on 2021-12-21 15:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('melophony', '0004_playlist_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='file_name',
            field=models.CharField(default=None, max_length=255),
        ),
    ]
