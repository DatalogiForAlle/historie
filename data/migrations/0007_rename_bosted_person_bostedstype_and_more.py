# Generated by Django 4.0.8 on 2022-12-02 14:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('data', '0006_rename_ægteskablig_stilling_person_ægteskabelig_stilling'),
    ]

    operations = [
        migrations.RenameField(
            model_name='person',
            old_name='bosted',
            new_name='bostedstype',
        ),
        migrations.RemoveField(
            model_name='person',
            name='bostedtype',
        ),
    ]
