from django.db.models import Q, Count, Value, Case, When
from django.db.models.functions import Coalesce
from django.views.generic import ListView, TemplateView
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest
from django.template import loader
from django.http import JsonResponse
from django.core import serializers

from .models import Person
from .models import Person1801, Person1850, Person1901
from .utils import translate_field, get_person_model, get_q_filter, get_filter_result
from .forms import SqlForm, SearchForm
from django.core.paginator import (
    Paginator,
    EmptyPage,
    PageNotAnInteger,
)


# for uploading csv
import csv
from io import TextIOWrapper
from django.views.generic.edit import FormView
from .forms import CSVUploadForm

from django.urls import reverse_lazy

from functools import reduce

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
            # "fødested_original",
            # "fødesogn_by_standardiseret",
            # "migrant_type",
        ]

        print("dict_reader.fieldnames: \n {}".format(dict_reader.fieldnames))
        for req_col in required_columns:
            if req_col not in dict_reader.fieldnames:
                raise Exception(
                    f"A required column is missing from the uploaded CSV: '{req_col}'"
                )

        print("The file name should be printed below")
        print(csv_file.name)
        if "1801" in csv_file.name:
            year = 1801
        elif "1850" in csv_file.name:
            year = 1850
        elif "1901" in csv_file.name:
            year = 1901
        else:
            raise Exception("Either 1801, 1850 or 1901 should appear in the file name")
        print("year is: ", year)
        data = []
        invalid_age_count = 0
        for row, item in enumerate(dict_reader, start=1):
            new_person = Person(
                år=year,
                pa_id=item["pa_id"],
                husstands_id=item["husstands_id"],
                fem_års_aldersgrupper=item["5års_aldersgrupper"],
                ti_års_aldersgrupper=item["10års_aldersgrupper"],
                navn=item["navn"],
                køn=item["køn"],
                alder=item["alder"],
                ægteskabelig_stilling=item["ægteskabelig_stilling"],
                sogn_by=item["sogn_by"],
                herred=item["herred"],
                amt=item["amt"],
                bostedstype=item["bostedstype"],
                erhverv_original=item["erhverv_original"],
                stilling_i_husstanden_standardiseret=item[
                    "stilling_i_husstanden_standardiseret"
                ],
                # fødested_original=item["fødested_original"],
                # fødesogn_by_standardiseret=item["fødesogn_by_standardiseret"],
                # migrant_type=item["migrant_type"],
            )
            # print("new person alder: ", new_person.alder)
            # print("new person alder type: ", type(new_person.alder))

            if int(new_person.alder) >= 0:
                data.append(new_person)
            else:
                invalid_age_count += 1
                if invalid_age_count % 100 == 0:
                    print(
                        "invalid age count incremented, it is now: ", invalid_age_count
                    )

            if len(data) > 500:
                Person.objects.bulk_create(data, ignore_conflicts=True)
                data = []

        if data:
            Person.objects.bulk_create(data)
            # self.process_item(item)
        print("invalid age count: ", invalid_age_count)

        # remove duplicates (based on pa_id) (move below if data later)
        # for row in Person.objects.all().reverse():
        #     if Person.objects.filter(pa_id=row.pa_id).count() > 1:
        #         print("removing duplicate")
        #         row.delete()

        # for duplicates in (
        #     Person.objects.values("pa_id")
        #     .annotate(records=Count("pa_id"))
        #     .filter(records__gt=1)
        # ):
        #     for p in Person.objects.filter(pa_id=duplicates["pa_id"])[1:]:
        #         p.delete()

        return super().form_valid(form)


class SearchResultsListView(ListView):
    paginate_by = 10
    model = Person
    context_object_name = "person_list"
    template_name = "search_results.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        get_copy = self.request.GET.copy()
        parameters = get_copy.pop("page", True) and get_copy.urlencode()
        context["parameters"] = parameters
        print("parameters are: ", parameters)
        return context

    def get_queryset(self):
        p = self.request.GET.get("pa_id")
        h = self.request.GET.get("husstands_id")
        n = self.request.GET.get("navn")
        genders = [
            value
            for value in [
                self.request.GET.get("female"),
                self.request.GET.get("male"),
            ]
            if value is not None
        ]
        bosteder = [
            value
            for value in [
                self.request.GET.get("land"),
                self.request.GET.get("by"),
                self.request.GET.get("københavn"),
            ]
            if value is not None
        ]
        marriage_statuses = [
            value
            for value in [
                self.request.GET.get("gift"),
                self.request.GET.get("ugift"),
                self.request.GET.get("enke"),
                self.request.GET.get("skilt"),
                self.request.GET.get("ukendt"),
            ]
            if value is not None
        ]
        min_age = self.request.GET.get("min_alder")
        max_age = self.request.GET.get("max_alder")

        q = (
            Q(navn__icontains=n)
            & Q(køn__in=genders)
            & Q(alder__gte=min_age, alder__lte=max_age)
            & Q(bostedstype__in=bosteder)
            & Q(ægteskabelig_stilling__in=marriage_statuses)
        )

        if p:
            q.add(Q(pa_id__exact=p), Q.AND)
        if h:
            q.add(Q(husstands_id__exact=h), Q.AND)

        return Person.objects.filter(q)


class SqlSearchResultsListView(ListView):
    paginate_by = 100
    model = Person
    context_object_name = "sql_person_list"

    def get(self, request):
        form = SqlForm(initial={"sql": "SELECT * FROM person LIMIT 100"})
        context = {"form": form}
        return render(request, "sql_search.html", context=context)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        get_copy = self.request.GET.copy()
        parameters = get_copy.pop("page", True) and get_copy.urlencode()
        context["parameters"] = parameters
        return context

    def post(self, request):
        context = {}
        form = SqlForm(request.POST)
        if form.is_valid():
            sql = form.cleaned_data["sql"]
            print("this is the request: ", sql)
            print(type(sql))
            context["sql_success"] = True
            results = Person.objects.raw(sql)
            context["results"] = results

        context["form"] = form

        t = loader.get_template("sql_search.html")

        try:
            response = HttpResponse(t.render(context, request))
            return response
        except:
            response = HttpResponse(
                t.render({"sql_error": True, "form": form}, request)
            )
            return response


def search(request):
    persons_per_page = 5

    context = {}

    # query = ""
    if request.GET:
        query = request.GET.get("q").lower()
        year = request.GET.get("year")
        search_category = request.GET.get("search_category")

        context["query"] = str(query)
        context["year"] = str(year)
        context["search_category"] = str(search_category)

        person = get_person_model(int(year))
        q_filter = get_q_filter(search_category, query)
        page_obj = get_filter_result(q_filter, person)

        get_copy = request.GET.copy()
        parameters = get_copy.pop("page", True) and get_copy.urlencode()
        context["parameters"] = parameters

        page = request.GET.get("page", 1)
        paginator = Paginator(page_obj, persons_per_page)

        try:
            page_obj = paginator.page(page)
        except PageNotAnInteger:
            page_obj = paginator.page(persons_per_page)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        context["page_obj"] = page_obj

    return render(request, "search/search.html", context)


def one_input_chart(request):
    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    if is_ajax:
        if request.method == "GET":
            x_val = translate_field(request.GET.get("x_val"))
            year = request.GET.get("year")
            search_category = request.GET.get("search_category")
            query = request.GET.get("query")

            # q_filter = Q(år=year)

            # print("query is: ", query)
            # print("query type is: ", type(query))
            # if search_category == "city":
            #     q_filter.add(Q(sogn_by=query), Q.AND)
            # elif search_category == "age":
            #     q_filter.add(Q(alder=query), Q.AND)
            person = get_person_model(int(year))
            q_filter = get_q_filter(search_category, query)
            filter_result = get_filter_result(q_filter, person)

            # querying the database, returns a list of dicts

            query_res = list(
                # person.objects.filter(q_filter)
                filter_result.values(x_val)
                .annotate(total=Count("id"))
                .order_by()
            )

            if x_val == "fem_års_aldersgrupper":
                # nødvendigt at sætte aldergrupperner i orden
                def sorting_key(elem):
                    five_group = elem.get("fem_års_aldersgrupper")
                    if "-" in five_group:
                        return int(five_group.split("-")[0])
                    elif "+" in five_group:
                        return int(five_group.split("+")[0])

                query_res_sorted = sorted(
                    [
                        item
                        for item in query_res
                        if item.get("fem_års_aldersgrupper") != "-1"
                    ],
                    # key=lambda x: int(x.split("-")[0]),
                    key=sorting_key,
                )
                # creating a dict with fieldvalue as key, count as value
                print("query_res_sorted", query_res_sorted)
                dict_res = {d[x_val]: d.get("total") for d in query_res_sorted}
            else:
                # creating a dict with fieldvalue as key, count as value
                print("queryres is: ", query_res)
                dict_res = {d[x_val]: d.get("total") for d in query_res}
                print("dict res one input: ", dict_res)

            labels, data = zip(*dict_res.items())
            # print("one input data: ", data)
            # print("one input data type: ", type(data))

            return JsonResponse({"labels": labels, "data": data, "datasetLabel": x_val})
        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")


def two_input_chart(request):
    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    if is_ajax:
        if request.method == "GET":
            x_val = translate_field(request.GET.get("x_val"))
            y_val = translate_field(request.GET.get("y_val"))
            year = request.GET.get("year")

            search_category = request.GET.get("search_category")
            query = request.GET.get("query")

            # q_filter = Q(år=year)

            # print("query is: ", query)
            # print("query type is: ", type(query))
            # if search_category == "city":
            #     q_filter.add(Q(sogn_by=query), Q.AND)
            # elif search_category == "age":
            #     q_filter.add(Q(alder=query), Q.AND)

            person = get_person_model(int(year))
            q_filter = get_q_filter(search_category, query)
            filter_result = get_filter_result(q_filter, person)
            # querying the database, returns a list of dicts
            query_res = list(
                # person.objects.filter(q_filter)
                filter_result.values(x_val, y_val)
                .annotate(total=Count("id"))
                .order_by()
            )

            # removing duplicates while preserving order
            def unique(sequence):
                seen = set()
                return [x for x in sequence if not (x in seen or seen.add(x))]

            # print("queryRes: ", query_res)
            # print("x: ", x_val)
            # print("y: ", y_val)
            x_labels = unique([d[x_val] for d in query_res])
            y_labels = unique([d[y_val] for d in query_res])

            def sort_age_labels(labels):
                def sorting_key(elem):
                    if "-" in elem:
                        return int(elem.split("-")[0])
                    elif "+" in elem:
                        return int(elem.split("+")[0])

                age_labels = sorted([l for l in labels if l != "-1"], key=sorting_key)
                print("agelabels: ", age_labels)
                return age_labels

            if x_val == "fem_års_aldersgrupper":
                x_labels = sort_age_labels(x_labels)
            elif y_val == "fem_års_aldersgrupper":
                y_labels = sort_age_labels(y_labels)

            # initializing datasets with total=0 for all possible combos, in case some combos do not exist in the query result
            datasets = []
            for x_label in x_labels:
                tempA = {}
                for y_label in y_labels:
                    tempA[y_label] = 0
                datasets.append({"label": x_label, "data": tempA})

            print("orig dataset: ", datasets)

            # update datasets with real values from queryset
            for i in range(len(datasets)):
                for d in query_res:
                    if datasets[i]["label"] == d[x_val]:
                        datasets[i]["data"][d[y_val]] = d["total"]

            print("datasets: ", datasets)
            # print("queryres: ", query_res)

            return JsonResponse({"labels": y_labels, "datasets": datasets})

        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")
