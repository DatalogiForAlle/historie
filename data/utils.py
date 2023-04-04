
field_dict = {
    "year": "år",
    "pa_id": "pa_id",
    "household_id": "husstands_id",
    "five": "fem_års_aldersgrupper",
    "ten": "ti_års_aldersgrupper",
    "name": "navn",
    "gender": "køn",
    "age":  "alder",
    "status": "ægteskabelig_stilling",
    "parish": "sogn_by",
    "hundred": "herred",
    "county": "amt",
    "location_type": "bostedstype",
    "job_original": "erhverv_original",
    "household_function_std": "fødesogn_by_standardiseret",
    "migrant": "migrant_type",
}

def translate_field(field_name):
    print("field_name is: ", field_name)
    return field_dict[field_name]

