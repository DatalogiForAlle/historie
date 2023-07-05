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
from .utils import (
    translate_field,
    get_query_values,
    get_query_result,
)
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
    # persons_per_page = 5

    context = {}

    if request.GET:
        query_values = get_query_values(request)

        context["year"] = str(query_values["year"])
        context["query_1"] = str(query_values["query_1"])
        context["search_category_1"] = str(query_values["search_category_1"])
        context["query_2"] = str(query_values["query_2"])
        context["search_category_2"] = str(query_values["search_category_2"])
        context["combine"] = str(query_values["combine"])
        context["submit_elm"] = str(query_values["submit_elm"])

        results_per_page = str(query_values["results_per_page"])
        context["results_per_page"] = results_per_page

        page_obj = get_query_result(query_values)

        get_copy = request.GET.copy()
        parameters = get_copy.pop("page", True) and get_copy.urlencode()
        context["parameters"] = parameters

        page = request.GET.get("page", 1)
        paginator = Paginator(page_obj, results_per_page)

        try:
            page_obj = paginator.page(page)
        except PageNotAnInteger:
            page_obj = paginator.page(results_per_page)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)

        context["page_obj"] = page_obj

    return render(request, "search/search.html", context)


def one_input_chart(request):
    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    if is_ajax:
        if request.method == "GET":
            x_val = translate_field(request.GET.get("x_val"))
            chart_type = request.GET.get("chartType")
            absRatio = request.GET.get("absRatio")
            print("chartType is: ", chart_type)
            query_values = get_query_values(request)
            filter_result = get_query_result(query_values)
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
            # elif x_val == "alder":
            #     # nødvendigt at sortere alder
            #     print("age queryres is: ", query_res)
            else:
                # creating a dict with fieldvalue as key, count as value
                print("queryres is: ", query_res)
                dict_res = {d[x_val]: d.get("total") for d in query_res}
                print("dict res one input: ", dict_res)

            if chart_type == "pie":
                NUM_CUTOFF = 5
                # only take biggest NUM_CUTOFF categories, the rest are lumped into other
                sorted_elms = sorted(dict_res.items(), key=lambda x: x[1], reverse=True)
                dict_res = dict(sorted_elms[:NUM_CUTOFF])
                other_total = sum(dict(sorted_elms[NUM_CUTOFF:]).values())
                if other_total != 0:
                    dict_res["andet"] = other_total
                print("pie dict res: ", dict_res)
            elif x_val == "sogn_by":
                NUM_CUTOFF = 20
                # only take biggest NUM_CUTOFF categories, the rest are lumped into other
                sorted_elms = sorted(dict_res.items(), key=lambda x: x[1], reverse=True)
                dict_res = dict(sorted_elms[:NUM_CUTOFF])
                print("pie dict res: ", dict_res)

            labels, data = zip(*dict_res.items())
            print("one input data: ", data)
            print("one input data type: ", type(data))
            print("labaels", labels)

            def get_percentages(ds):
                ds_list = list(ds)
                items_total = sum(ds_list)
                percentages = [((x / items_total) * 100) for x in ds_list]
                print("items_total: ", items_total)
                print("ds_list: ", ds_list)
                print("percentages: ", percentages)
                return tuple(percentages)

            if absRatio == "absolute":
                return JsonResponse(
                    {"labels": labels, "data": data, "datasetLabel": x_val}
                )
            else:
                return JsonResponse(
                    {
                        "labels": labels,
                        "data": get_percentages(data),
                        "datasetLabel": x_val,
                    }
                )

        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")


def two_input_chart(request):
    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    if is_ajax:
        if request.method == "GET":
            x_val = translate_field(request.GET.get("x_val"))
            y_val = translate_field(request.GET.get("y_val"))
            abs_ratio = request.GET.get("absRatio")

            query_values = get_query_values(request)
            filter_result = get_query_result(query_values)

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

            print("queryRes: ", query_res)
            print("x: ", x_val)
            print("y: ", y_val)
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

            if x_val == "alder":
                x_labels = sorted(x_labels)
            if y_val == "alder":
                y_labels = sorted(y_labels)

            print("x_labels: ", x_labels)
            print("y_labels: ", y_labels)

            # initializing datasets with total=0 for all possible combos, in case some combos do not exist in the query result
            def get_empty_dataset(xls, yls):
                empty_ds = []
                for xl in xls:
                    tempA = {}
                    for yl in yls:
                        tempA[yl] = 0
                    empty_ds.append({"label": xl, "data": tempA})
                return empty_ds

            # datasets = []
            # for x_label in x_labels:
            #     tempA = {}
            #     for y_label in y_labels:
            #         tempA[y_label] = 0
            #     datasets.append({"label": x_label, "data": tempA})
            datasets = get_empty_dataset(x_labels, y_labels)

            print("empty dataset: ", datasets)

            # update datasets with real values from queryset
            for i in range(len(datasets)):
                for d in query_res:
                    if datasets[i]["label"] == d[x_val]:
                        datasets[i]["data"][d[y_val]] = d["total"]

            def get_percentages(xls, yls, ds):
                percentage_ds = get_empty_dataset(xls, yls)
                for yl in yls:
                    yl_total = 0
                    for d in ds:
                        yl_total += d["data"][yl]
                    print(yl_total)
                    for i in range(len(percentage_ds)):
                        xl = percentage_ds[i]["label"]
                        xl_yl = [x["data"][yl] for x in ds if x["label"] == xl][0]
                        xl_yl_percentage = (xl_yl / yl_total) * 100
                        percentage_ds[i]["data"][yl] = xl_yl_percentage
                return percentage_ds

            percentage_ds = get_percentages(x_labels, y_labels, datasets)
            print("percentage_datasets: ", percentage_ds)
            print("datasets: ", datasets)
            print("labels: ", y_labels)
            y_labels = [str(x) for x in y_labels]
            print("labels: ", y_labels)
            # print("queryres: ", query_res)

            if abs_ratio == "absolute":
                return JsonResponse({"labels": y_labels, "datasets": datasets})
            else:
                return JsonResponse({"labels": y_labels, "datasets": percentage_ds})

        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")


def population_pyramid(request):
    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    if is_ajax:
        if request.method == "GET":
            x_val = translate_field(request.GET.get("x_val"))
            y_val = translate_field(request.GET.get("y_val"))
            abs_ratio = request.GET.get("absRatio")

            query_values = get_query_values(request)
            filter_result = get_query_result(query_values)

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

            x_labels = unique([d[x_val] for d in query_res])[::-1]
            y_labels = unique([d[y_val] for d in query_res])

            # print("queryRes: ", query_res)
            # print("x: ", x_val)
            # print("y: ", y_val)
            # print("x_label_unique: ", x_labels)
            # print("y_label_unique: ", y_labels)

            def sort_age_labels(labels):
                def sorting_key(elem):
                    if elem[0] == "-":
                        return int(elem)
                    elif "-" in elem:
                        return int(elem.split("-")[0])
                    elif "+" in elem:
                        return int(elem.split("+")[0])

                age_labels = sorted(labels, key=sorting_key, reverse=True)
                print("agelabels: ", age_labels)
                return age_labels

            if x_val == "fem_års_aldersgrupper":
                x_labels = sort_age_labels(x_labels)
            elif y_val == "fem_års_aldersgrupper":
                y_labels = sort_age_labels(y_labels)

            if x_val == "alder":
                x_labels = sorted(x_labels)
            if y_val == "alder":
                y_labels = sorted(y_labels)

            # print("x_labels: ", x_labels)
            # print("y_labels: ", y_labels)

            # initializing datasets with total=0 for all possible combos, in case some combos do not exist in the query result
            def get_empty_dataset(xls, yls):
                empty_ds = []
                for xl in xls:
                    tempA = {}
                    for yl in yls:
                        tempA[yl] = 0
                    empty_ds.append({"label": xl, "data": tempA})
                return empty_ds

            datasets = get_empty_dataset(x_labels, y_labels)

            print("empty dataset: ", datasets)

            # update datasets with real values from queryset
            for i in range(len(datasets)):
                for d in query_res:
                    if datasets[i]["label"] == d[x_val]:
                        datasets[i]["data"][d[y_val]] = d["total"]

            def get_population_percentages(xls, yls, ds):
                print("ds is: ", ds)
                percentage_ds = get_empty_dataset(xls, yls)
                total = 0
                for yl in yls:
                    for d in ds:
                        total += d["data"][yl]
                print("total is: ", total)
                for yl in yls:
                    for i in range(len(percentage_ds)):
                        xl = percentage_ds[i]["label"]
                        xl_yl = [x["data"][yl] for x in ds if x["label"] == xl][0]
                        xl_yl_percentage = (xl_yl / total) * 100
                        percentage_ds[i]["data"][yl] = xl_yl_percentage
                return percentage_ds

            percentage_ds = get_population_percentages(x_labels, y_labels, datasets)

            # percentage_ds = get_percentages(x_labels, y_labels, datasets)
            # print("percentage_datasets: ", percentage_ds)
            # print("datasets: ", datasets)
            # print("labels: ", y_labels)
            y_labels = [str(x) for x in y_labels]
            # print("labels: ", y_labels)
            # print("queryres: ", query_res)

            def get_list_of_values(elm):
                _, val_list = zip(*elm["data"].items())
                elm["data"] = list(val_list)
                if elm["label"] == "m":
                    elm["data"] = [x * (-1) for x in elm["data"]]
                return elm

            list(map(get_list_of_values, datasets))
            list(map(get_list_of_values, percentage_ds))
            # print("new_ds: ", new_ds)

            print("datasets_changed: ", datasets)
            print("percentage datasets changed: ", percentage_ds)

            if abs_ratio == "absolute":
                return JsonResponse({"labels": y_labels, "datasets": datasets})
            else:
                return JsonResponse({"labels": y_labels, "datasets": percentage_ds})

        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")
