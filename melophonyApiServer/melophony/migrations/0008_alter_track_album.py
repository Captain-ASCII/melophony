# Generated by Django 4.0 on 2021-12-30 17:47

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('melophony', '0007_rename_artist_track_artists'),
    ]

    operations = [
        migrations.AlterField(
            model_name='track',
            name='album',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, to='melophony.album'),
        ),
    ]
