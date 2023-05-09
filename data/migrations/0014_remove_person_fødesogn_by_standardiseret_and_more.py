# Generated by Django 4.0.8 on 2023-05-03 10:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0013_alter_person_options'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='person',
            name='fødesogn_by_standardiseret',
        ),
        migrations.RemoveField(
            model_name='person',
            name='fødested_original',
        ),
        migrations.RemoveField(
            model_name='person',
            name='migrant_type',
        ),
        migrations.AlterField(
            model_name='person',
            name='alder',
            field=models.PositiveIntegerField(),
        ),
        migrations.AlterField(
            model_name='person',
            name='pa_id',
            field=models.CharField(max_length=100),
        ),
    ]
