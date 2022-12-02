from django.contrib import admin

# Register your models here.

from .models import Person


class PersonAdmin(admin.ModelAdmin):
    list_display = (
        "pa_id",
        "husstands_id",
        "fem_års_aldersgrupper",
        "ti_års_aldersgrupper",
        "navn",
        "køn",
        "alder",
        "ægteskabelig_stilling",
        "sogn_by",
        "herred",
        "amt",
        "bostedstype",
        "erhverv_original",
        "stilling_i_husstanden_standardiseret",
        "fødested_original",
        "fødesogn_by_standardiseret",
        "migrant_type",
    )


admin.site.register(Person, PersonAdmin)
