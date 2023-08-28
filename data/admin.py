from django.contrib import admin
from .models import Person1801, Person1850, Person1901
from .management.commands.load_datasets import get_required_columns, get_model_fields


def get_list_display(year):
    return get_model_fields(get_required_columns(year))


class Person1801Admin(admin.ModelAdmin):
    list_display = get_list_display(1801)


class Person1850Admin(admin.ModelAdmin):
    list_display = get_list_display(1850)


class Person1901Admin(admin.ModelAdmin):
    list_display = get_list_display(1901)


# Register your models here.
admin.site.register(Person1801, Person1801Admin)
admin.site.register(Person1850, Person1850Admin)
admin.site.register(Person1901, Person1901Admin)
