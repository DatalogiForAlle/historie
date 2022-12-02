from django.db.models import Q
from django.views.generic import ListView

from .models import Person


# for uploading csv
import csv
from io import TextIOWrapper
from django.views.generic.edit import FormView
from .forms import CSVUploadForm

from django.urls import reverse_lazy

# Create your views here.


class CustomCSVViews(FormView):
    template_name = "upload.html"
    form_class = CSVUploadForm
    success_url = reverse_lazy("custom-csv-view")

    def form_valid(self, form):
        csv_file = form.cleaned_data["file"]
        f = TextIOWrapper(csv_file.file)
        dict_reader = csv.DictReader(f, delimiter="$")

        required_columns = [
            "pa_id",
            "husstands_id",
            "5års_aldersgrupper",
            "10års_aldersgrupper",
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
        ]

        print("dict_reader.fieldnames: \n {}".format(dict_reader.fieldnames))
        for req_col in required_columns:
            if req_col not in dict_reader.fieldnames:
                raise Exception(
                    f"A required column is missing from the uploaded CSV: '{req_col}'"
                )

        data = []
        for row, item in enumerate(dict_reader, start=1):
            new_person = Person(
                pa_id=item["pa_id"],
                husstands_id=item["husstands_id"],
                fem_års_aldersgrupper=item["5års_aldersgrupper"],
                ti_års_aldersgrupper=item["10års_aldersgrupper"],
                navn=item["navn"],
                køn=item["køn"],
                alder=item["alder"],
                ægteskabelig_stilling=item["ægteskabelig_stilling"],
                herred=item["herred"],
                amt=item["amt"],
                bostedstype=item["bostedstype"],
                erhverv_original=item["erhverv_original"],
                stilling_i_husstanden_standardiseret=item[
                    "stilling_i_husstanden_standardiseret"
                ],
                fødested_original=item["fødested_original"],
                fødesogn_by_standardiseret=item["fødesogn_by_standardiseret"],
                migrant_type=item["migrant_type"],
            )

            data.append(new_person)

            if len(data) > 5000:
                Person.objects.bulk_create(data)
                data = []
        if data:
            Person.objects.bulk_create(data)
            # self.process_item(item)

        return super().form_valid(form)


class SearchResultsListView(ListView):
    paginate_by = 100
    model = Person
    context_object_name = "person_list"
    template_name = "search_results.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        get_copy = self.request.GET.copy()
        parameters = get_copy.pop("page", True) and get_copy.urlencode()
        context["parameters"] = parameters
        return context

    def get_queryset(self):
        q1 = self.request.GET.get("navn")
        f = self.request.GET.get("female")
        m = self.request.GET.get("male")
        genders = [value for value in [f, m] if value is not None]

        return Person.objects.filter(Q(navn__icontains=q1) & Q(køn__in=genders))
