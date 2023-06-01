from django.contrib import admin

# Register your models here.

# from .models import Person
from .models import Person1801, Person1850, Person1901

from .management.commands.load_datasets import get_required_columns, get_model_fields


def get_list_display(year):
    return get_model_fields(get_required_columns(year))


# class PersonAdmin(admin.ModelAdmin):
#     list_display = (
#         "år",
#         "pa_id",
#         "husstands_id",
#         "fem_års_aldersgrupper",
#         "ti_års_aldersgrupper",
#         "navn",
#         "køn",
#         "alder",
#         "ægteskabelig_stilling",
#         "sogn_by",
#         "herred",
#         "amt",
#         "bostedstype",
#         "erhverv_original",
#         "stilling_i_husstanden_standardiseret",
#         # "fødested_original",
#         # "fødesogn_by_standardiseret",
#         # "migrant_type",
#     )


class Person1801Admin(admin.ModelAdmin):
    # print("list display: ", tuple(get_required_columns(1801)))
    list_display = get_list_display(1801)


class Person1850Admin(admin.ModelAdmin):
    list_display = get_list_display(1850)


class Person1901Admin(admin.ModelAdmin):
    list_display = get_list_display(1901)


# admin.site.register(Person, PersonAdmin)
admin.site.register(Person1801, Person1801Admin)
admin.site.register(Person1850, Person1850Admin)
admin.site.register(Person1901, Person1901Admin)
