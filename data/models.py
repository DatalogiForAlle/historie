from django.db import models

# Create your models here.


class Person(models.Model):

    år = models.PositiveIntegerField(default=None)
    pa_id = models.PositiveIntegerField()
    husstands_id = models.PositiveIntegerField()
    fem_års_aldersgrupper = models.CharField(max_length=200)
    ti_års_aldersgrupper = models.CharField(max_length=200)
    navn = models.CharField(max_length=200)
    GENDER_CHOICES = [
        ("f", "female"),
        ("m", "male"),
    ]
    køn = models.CharField(
        max_length=1,
        choices=GENDER_CHOICES,
        default="f",
    )
    alder = models.FloatField()
    STATUS_CHOICES = [
        ("ugift", "ugift"),
        ("gift", "gift"),
        ("enke", "enke"),
        ("ukendt", "ukendt"),
        ("skilt", "skilt"),
    ]
    ægteskabelig_stilling = models.CharField(
        max_length=100, choices=STATUS_CHOICES, default="gift", db_index=True
    )
    sogn_by = models.CharField(max_length=200)
    herred = models.CharField(max_length=200)
    amt = models.CharField(max_length=200)
    BOSTED_CHOICES = [
        ("land", "land"),
        ("by", "by"),
        ("københavn", "københavn"),
    ]
    bostedstype = models.CharField(
        max_length=100,
        choices=BOSTED_CHOICES,
        default="land",
    )
    erhverv_original = models.CharField(max_length=200)
    stilling_i_husstanden_standardiseret = models.CharField(max_length=200)
    fødested_original = models.CharField(max_length=200)
    fødesogn_by_standardiseret = models.CharField(max_length=200)
    MIGRANT_CHOICES = [
        ("migrant", "migrant"),
        ("indfødt", "indfødt"),
        ("ukendt", "ukendt"),
    ]
    migrant_type = models.CharField(
        max_length=100,
        choices=MIGRANT_CHOICES,
        default="indfødt",
    )

    class Meta:
        db_table = "person"
        ordering = ['-id']
        # indexes = [models.Index(fields=["ægteskabelig_stilling"])]

    def __str__(self):
        return str(self.pa_id)
