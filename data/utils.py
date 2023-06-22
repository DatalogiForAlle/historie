from .models import Person1801, Person1850, Person1901
from django.db.models import Q

field_dict = {
    "year": "år",
    "pa_id": "pa_id",
    "household_id": "husstands_id",
    "five": "fem_års_aldersgrupper",
    "ten": "ti_års_aldersgrupper",
    "name": "navn",
    "gender": "køn",
    "age": "alder",
    "status": "ægteskabelig_stilling",
    "parish": "sogn_by",
    "hundred": "herred",
    "county": "amt",
    "location": "bostedstype",
    "job_original": "erhverv_original",
    "household_function_std": "stilling_i_husstanden_standardiseret",
    # "fødesogn_by_standardiseret",
    # "migrant": "migrant_type",
}


def translate_field(field_name):
    print("field_name is: ", field_name)
    return field_dict[field_name]


def get_person_model(year):
    match year:
        case 1801:
            return Person1801
        case 1850:
            return Person1850
        case 1901:
            return Person1901


def get_q_filter(search_category, query):
    match search_category:
        case "parish":
            return Q(sogn_by=query)
        case "age":
            return Q(alder=query)
        case "age-interval":
            ages = query.split("-")
            return Q(alder__gte=ages[0]) & Q(alder__lte=ages[1])
        case "gender":
            return Q(køn=query)
        case "household-function-std":
            return Q(stilling_i_husstanden_standardiseret=query)
        case "status":
            return Q(ægteskabelig_stilling=query)
        case "migration":
            return Q(migrant_type=query)


def get_single_filter_result(q_filter, person):
    if q_filter:
        filter_result = person.objects.filter(q_filter)
    else:
        filter_result = person.objects.all()
    return filter_result


def combine_with_query_2_filter(filter_result_query_1, q2_filter, combine):
    if q2_filter:
        if combine == "include":
            return filter_result_query_1.filter(q2_filter)
        if combine == "exclude":
            return filter_result_query_1.exclude(q2_filter)
    else:
        return filter_result_query_1


def get_query_values(request):
    year = request.GET.get("year")
    query_1 = request.GET.get("q1").lower()
    search_category_1 = request.GET.get("search-category-1")
    query_2 = request.GET.get("q2").lower()
    search_category_2 = request.GET.get("search-category-2")
    combine = request.GET.get("combine")
    results_per_page = request.GET.get("num-results", 5)
    submit_elm = request.GET.get("submit-elm")

    return {
        "year": year,
        "query_1": query_1,
        "search_category_1": search_category_1,
        "query_2": query_2,
        "search_category_2": search_category_2,
        "combine": combine,
        "results_per_page": results_per_page,
        "submit_elm": submit_elm,
    }


def get_query_result(query_values):
    person = get_person_model(int(query_values["year"]))
    q1_filter = get_q_filter(query_values["search_category_1"], query_values["query_1"])
    q2_filter = get_q_filter(query_values["search_category_2"], query_values["query_2"])

    # page_obj = get_filter_result(q1_filter, person)

    filter_result_query_1 = get_single_filter_result(q1_filter, person)
    return combine_with_query_2_filter(
        filter_result_query_1, q2_filter, query_values["combine"]
    )
