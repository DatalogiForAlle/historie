from django import forms
from django.core.exceptions import ValidationError


class CSVUploadForm(forms.Form):
    file = forms.FileField()

    def clean(self):
        cleaned_data = super().clean()
        file = cleaned_data.get("file")
        if not file.name.endswith(".csv"):
            raise ValidationError(
                {"file": _("Filetype not supported, the file must be a '.csv'")}
            )
        return cleaned_data


class SqlForm(forms.Form):
    sql = forms.CharField(
        widget=forms.Textarea(
            attrs={"rows": "5", "cols": "200"},
        ),
        required=True,
        label="Indtast en SQL-forespørgsel i boksen og tryk på 'send'",
        help_text="",
    )

    def clean_sql(self):
        sql = self.cleaned_data["sql"]

        if "delete" in sql.lower():
            raise forms.ValidationError(
                "Du har ikke tilladelse til at udføre DELETE-operationer"
            )

        if "update" in sql.lower():
            raise forms.ValidationError(
                "Du har ikke tilladelse til at udføre UPDATE-operationer"
            )

        if "create" in sql.lower():
            raise forms.ValidationError(
                "Du har ikke tilladelse til at udføre CREATE-operationer"
            )

        if "drop" in sql.lower():
            raise forms.ValidationError(
                "Du har ikke tilladelse til at udføre DROP-operationer"
            )

        if "insert" in sql.lower():
            raise forms.ValidationError(
                "Du har ikke tilladelse til at udføre INSERT-operationer"
            )

        if "truncate" in sql.lower():
            raise forms.ValidationError(
                "Du har ikke tilladelse til at udføre TRUNCATE-operationer"
            )

        if sql.lower()[:6].lower() != "select":
            raise forms.ValidationError("Din forespørgsel skal starte med 'SELECT'")

        # a quickfix for lack of pagination:
        if "limit" not in sql.lower():
            sql += " limit 100"

        return sql


class SearchForm(forms.Form):
    YEARS = [
        (1850, 1850),
        (1901, 1901),
    ]
    year = forms.ChoiceField(choices=YEARS, widget=forms.RadioSelect())

    # CRITERIA = [
    #     ("Byer", "Byer"),
    #     ("Alder", "Alder")
    # ]
    # search_criterium = forms.ChoiceField(choices=CRITERIA, widget=forms.RadioSelect())
