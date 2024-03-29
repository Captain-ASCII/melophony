# Generated by Django 4.0 on 2022-01-11 18:20

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('melophony', '0008_alter_track_album'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlaylistTrack',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('order', models.PositiveIntegerField()),
            ],
        ),
        migrations.RemoveField(
            model_name='playlist',
            name='tracks',
        ),
        migrations.AddField(
            model_name='playlist',
            name='tracks',
            field=models.ManyToManyField(through='melophony.PlaylistTrack', to='melophony.Track'),
        ),
        migrations.AddField(
            model_name='playlisttrack',
            name='playlist',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='melophony.playlist'),
        ),
        migrations.AddField(
            model_name='playlisttrack',
            name='track',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='melophony.track'),
        ),
    ]
