# Generated by Django 4.0 on 2022-01-23 14:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('melophony', '0011_rename_image_name_artist_imagename_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='playlist',
            name='imageName',
            field=models.CharField(max_length=128, null=True),
        ),
        migrations.AddField(
            model_name='playlist',
            name='imageUrl',
            field=models.CharField(max_length=512, null=True),
        ),
    ]
