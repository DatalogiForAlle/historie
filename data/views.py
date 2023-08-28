from django.db.models import Count, F
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseBadRequest
from django.http import JsonResponse
from .utils import (
    translate_field,
    get_query_values,
    get_query_result,
    get_chart_label,
    get_filter_overview,
    translate_field_for_chart_info,
)
from django.core.paginator import (
    Paginator,
    EmptyPage,
    PageNotAnInteger,
)
import json


def search(request):
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

        filter_overview = get_filter_overview(query_values)
        context["filter_overview"] = json.dumps(filter_overview)

        print("filteroverview search is: ", filter_overview)
        print("context is: ", context)

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
            query_values = get_query_values(request)

            filter_overview = get_filter_overview(query_values)
            filter_overview["xVal"] = translate_field_for_chart_info(
                request.GET.get("x_val")
            )

            filter_result = get_query_result(query_values)
            # querying the database, returns a list of dicts
            query_res = list(
                filter_result.values(x_val).annotate(total=Count("id")).order_by()
            )

            if x_val == "fem_års_aldersgrupper":
                # nødvendigt at sætte aldergrupperner i orden, aldersgruppe -1 skal optræde sidst
                def sorting_key(elem):
                    five_group = elem.get("fem_års_aldersgrupper")
                    if five_group == "-1":
                        return -1000 / int(five_group)
                    if "-" in five_group:
                        return int(five_group.split("-")[0])
                    elif "+" in five_group:
                        return int(five_group.split("+")[0])

                query_res_sorted = sorted(
                    query_res,
                    key=sorting_key,
                )
                # creating a dict with fieldvalue as key, count as value
                dict_res = {d[x_val]: d.get("total") for d in query_res_sorted}

            elif x_val == "alder":

                def sorting_key(elem):
                    age = elem.get("alder")
                    if age == -1:
                        return -1000 / age
                    else:
                        return age

                query_res_sorted = sorted(query_res, key=sorting_key)
                dict_res = {d[x_val]: d.get("total") for d in query_res_sorted}
            else:
                # creating a dict with fieldvalue as key, count as value
                dict_res = {d[x_val]: d.get("total") for d in query_res}

            if chart_type == "pie":
                NUM_CUTOFF = 5
                # only take biggest NUM_CUTOFF categories, the rest are lumped into other
                sorted_elms = sorted(dict_res.items(), key=lambda x: x[1], reverse=True)
                dict_res = dict(sorted_elms[:NUM_CUTOFF])
                other_total = sum(dict(sorted_elms[NUM_CUTOFF:]).values())
                if other_total != 0:
                    dict_res["andet"] = other_total
            elif x_val in ["sogn_by", "husstands_id", "erhverv_original"]:
                NUM_CUTOFF = 20
                # only take biggest NUM_CUTOFF categories, the rest are lumped into other
                sorted_elms = sorted(dict_res.items(), key=lambda x: x[1], reverse=True)
                dict_res = dict(sorted_elms[:NUM_CUTOFF])

            labels, data = zip(*dict_res.items())

            def get_percentages(ds):
                ds_list = list(ds)
                items_total = sum(ds_list)
                percentages = [((x / items_total) * 100) for x in ds_list]
                return tuple(percentages)

            if absRatio == "ratio":
                data = get_percentages(data)

            return JsonResponse(
                {
                    "labels": labels,
                    "data": data,
                    "datasetLabel": x_val,
                    "filterOverview": filter_overview,
                }
            )

        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")


def two_input_chart(request):
    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    if is_ajax:
        if request.method == "GET":
            # quickfix: swapping x and y to make it fit with how you choose them in the interface
            x_val = translate_field(request.GET.get("y_val"))
            y_val = translate_field(request.GET.get("x_val"))
            abs_ratio = request.GET.get("absRatio")

            query_values = get_query_values(request)
            filter_result = get_query_result(query_values)

            filter_overview = get_filter_overview(query_values)
            filter_overview["xVal"] = translate_field_for_chart_info(
                request.GET.get("x_val")
            )
            filter_overview["yVal"] = translate_field_for_chart_info(
                request.GET.get("y_val")
            )

            # querying the database, returns a list of dicts
            query_res = list(
                filter_result.values(x_val, y_val)
                .annotate(total=Count("id"))
                .order_by()
            )

            # removing duplicates while preserving order
            def unique(sequence):
                seen = set()
                return [x for x in sequence if not (x in seen or seen.add(x))]

            x_labels = unique([d[x_val] for d in query_res])
            y_labels = unique([d[y_val] for d in query_res])

            def sort_age_labels(labels):
                def sorting_key(elem):
                    if elem == "-1":
                        return -1000 / int(elem)
                    if "-" in elem:
                        return int(elem.split("-")[0])
                    elif "+" in elem:
                        return int(elem.split("+")[0])

                age_labels = sorted(labels, key=sorting_key)
                return age_labels

            if x_val == "fem_års_aldersgrupper":
                x_labels = sort_age_labels(x_labels)
            elif y_val == "fem_års_aldersgrupper":
                y_labels = sort_age_labels(y_labels)

            if x_val == "alder":
                x_labels = sorted(x_labels, key=lambda i: -1000 / i if i == -1 else i)
            if y_val == "alder":
                y_labels = sorted(y_labels, key=lambda i: -1000 / i if i == -1 else i)

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
                    for i in range(len(percentage_ds)):
                        xl = percentage_ds[i]["label"]
                        xl_yl = [x["data"][yl] for x in ds if x["label"] == xl][0]
                        xl_yl_percentage = (xl_yl / yl_total) * 100
                        percentage_ds[i]["data"][yl] = xl_yl_percentage
                return percentage_ds

            if abs_ratio == "ratio":
                datasets = get_percentages(x_labels, y_labels, datasets)
            y_labels = [str(x) for x in y_labels]

            colorlist = [
                "#e6194B",
                "#3cb44b",
                "#ffe119",
                "#4363d8",
                "#f58231",
                "#911eb4",
                "#42d4f4",
                "#f032e6",
                "#bfef45",
                "#fabed4",
                "#469990",
                "#dcbeff",
                "#9A6324",
                "#fffac8",
                "#800000",
                "#aaffc3",
                "#808000",
                "#ffd8b1",
                "#000075",
                "#a9a9a9",
                # "#ffffff",
                "#000000",
            ]
            if len(datasets) > 7:
                print("dataset was over 7 long")
                for i in range(len(datasets)):
                    datasets[i]["backgroundColor"] = colorlist[i % 21]
                    datasets[i]["borderColor"] = colorlist[i % 21]

            chart_label = get_chart_label(y_val)

            return JsonResponse(
                {
                    "labels": y_labels,
                    "datasets": datasets,
                    "chartLabel": chart_label,
                    "filterOverview": filter_overview,
                }
            )

        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")


def population_pyramid(request):
    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    if is_ajax:
        if request.method == "GET":
            x_val = translate_field(request.GET.get("x_val"))
            y_val = translate_field(request.GET.get("y_val"))

            # any order of køn and alder should be valid
            if x_val != "køn":
                y_val = x_val
                x_val = "køn"

            abs_ratio = request.GET.get("absRatio")

            query_values = get_query_values(request)
            filter_result = get_query_result(query_values)

            filter_overview = get_filter_overview(query_values)
            filter_overview["xVal"] = translate_field_for_chart_info(
                request.GET.get("x_val")
            )
            filter_overview["yVal"] = translate_field_for_chart_info(
                request.GET.get("y_val")
            )

            # querying the database, returns a list of dicts
            query_res = list(
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

            def sort_age_labels(labels):
                def sorting_key(elem):
                    if elem[0] == "-":
                        return int(elem)
                    elif "-" in elem:
                        return int(elem.split("-")[0])
                    elif "+" in elem:
                        return int(elem.split("+")[0])

                age_labels = sorted(labels, key=sorting_key, reverse=True)
                return age_labels

            if x_val == "fem_års_aldersgrupper":
                x_labels = sort_age_labels(x_labels)
            elif y_val == "fem_års_aldersgrupper":
                y_labels = sort_age_labels(y_labels)

            if x_val == "alder":
                x_labels = sorted(x_labels, reverse=True)
            if y_val == "alder":
                y_labels = sorted(y_labels, reverse=True)

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

            # update datasets with real values from queryset
            for i in range(len(datasets)):
                for d in query_res:
                    if datasets[i]["label"] == d[x_val]:
                        datasets[i]["data"][d[y_val]] = d["total"]

            def get_population_percentages(xls, yls, ds):
                percentage_ds = get_empty_dataset(xls, yls)
                total = 0
                for yl in yls:
                    for d in ds:
                        total += d["data"][yl]

                for yl in yls:
                    for i in range(len(percentage_ds)):
                        xl = percentage_ds[i]["label"]
                        xl_yl = [x["data"][yl] for x in ds if x["label"] == xl][0]
                        xl_yl_percentage = (xl_yl / total) * 100
                        percentage_ds[i]["data"][yl] = xl_yl_percentage
                return percentage_ds

            if abs_ratio == "ratio":
                datasets = get_population_percentages(x_labels, y_labels, datasets)

            y_labels = [str(x) for x in y_labels]

            def get_list_of_values(elm):
                _, val_list = zip(*elm["data"].items())
                elm["data"] = list(val_list)
                if elm["label"] == "m":
                    elm["data"] = [x * (-1) for x in elm["data"]]
                return elm

            list(map(get_list_of_values, datasets))
            return JsonResponse(
                {
                    "labels": y_labels,
                    "datasets": datasets,
                    "filterOverview": filter_overview,
                }
            )

        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")


def county_map(request):
    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    if is_ajax:
        if request.method == "GET":
            x_val = translate_field(request.GET.get("x_val"))
            abs_ratio = request.GET.get("absRatio")

            query_values = get_query_values(request)
            filter_result = get_query_result(query_values)
            query_res = list(filter_result.values(x_val).annotate(total=Count("id")))

            filter_result = get_query_result(query_values)

            filter_overview = get_filter_overview(query_values)
            filter_overview["xVal"] = translate_field_for_chart_info(
                request.GET.get("x_val")
            )

            dict_res = {d[x_val]: d.get("total") for d in query_res}
            labels, data = zip(*dict_res.items())

            def get_percentages(ds):
                ds_list = list(ds)
                items_total = sum(ds_list)
                percentages = [((x / items_total) * 100) for x in ds_list]
                return tuple(percentages)

            if abs_ratio == "ratio":
                dict_res = dict(zip(labels, get_percentages(data)))

            return JsonResponse(
                {"dataset": dict_res, "filterOverview": filter_overview}
            )

        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")


def aggregation_list(request):
    is_ajax = request.headers.get("X-Requested-With") == "XMLHttpRequest"

    if is_ajax:
        if request.method == "GET":
            x_val = translate_field(request.GET.get("x_val"))
            # abs_ratio = request.GET.get("absRatio")
            # print("absratio is: ", abs_ratio)

            page_number = int(request.GET.get("page"))
            key_number = request.GET.get("key")

            query_values = get_query_values(request)
            filter_result = get_query_result(query_values)

            filter_overview = get_filter_overview(query_values)
            filter_overview["xVal"] = translate_field_for_chart_info(
                request.GET.get("x_val")
            )

            base_query = (
                (
                    filter_result.values(x_val, total=F("husstands_størrelse"))
                    .order_by("-total", x_val)
                    .distinct()
                )
                if x_val == "husstands_id"
                else (
                    filter_result.values(x_val)
                    .annotate(total=Count("id"))
                    .order_by("-total", x_val)
                )
            )

            PER_PAGE = 10
            if not key_number:  ## query for the first results
                query_res = list(base_query)

                def aggregate_res(query_res):
                    agg_dict = {}
                    res_dict = {}  # dict of lists of first ten elms for each total
                    for elm in query_res:
                        total_key = elm["total"]
                        res_key = elm[x_val]
                        if total_key in agg_dict.keys():
                            agg_dict[total_key] += 1
                        else:
                            agg_dict[total_key] = 1

                        if total_key not in res_dict.keys():
                            res_dict[total_key] = {
                                "results": [res_key],
                                "lastPage": True,
                            }
                        elif len(res_dict[total_key]["results"]) < (
                            PER_PAGE * page_number
                        ):
                            res_dict[elm["total"]]["results"].append(res_key)
                        else:
                            res_dict[elm["total"]]["lastPage"] = False
                    return agg_dict, res_dict

                (aggregate_result, first_results) = aggregate_res(query_res)

                return JsonResponse(
                    {
                        "aggregationOverview": aggregate_result,
                        "firstResults": first_results,
                        "filterOverview": filter_overview,
                    }
                )

            else:
                query_res = (
                    list(base_query.filter(husstands_størrelse=key_number))
                    if x_val == "husstands_id"
                    else list(base_query.filter(total=key_number))
                )
                paginator = Paginator(query_res, PER_PAGE)

                if int(page_number) < paginator.num_pages:
                    page_obj = paginator.get_page(page_number)
                    return JsonResponse(
                        {
                            "nextResults": [x[x_val] for x in page_obj.object_list],
                            "lastPage": False,
                        }
                    )
                elif int(page_number) == paginator.num_pages:
                    page_obj = paginator.get_page(page_number)
                    return JsonResponse(
                        {
                            "nextResults": [x[x_val] for x in page_obj.object_list],
                            "lastPage": True,
                        }
                    )

        return JsonResponse({"status": "Invalid request"}, status=400)
    else:
        return HttpResponseBadRequest("Invalid request")
