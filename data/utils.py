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
    if search_category == "city":
        return Q(sogn_by=query)
    elif search_category == "age":
        return Q(alder=query)
    # if search_category == "city":
    #     q_filter.add(Q(sogn_by=query), Q.AND)
    # elif search_category == "age":
    #     q_filter.add(Q(alder=query), Q.AND)


def get_filter_result(q_filter, person):
    if q_filter:
        filter_result = person.objects.filter(q_filter)
    else:
        filter_result = person.objects.all()
    return filter_result
