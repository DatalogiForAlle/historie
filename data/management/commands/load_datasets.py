from csv import DictReader
from django.core.management import BaseCommand

# from data.models import Person
from data.models import Person1801, Person1850, Person1901
from tqdm import tqdm
from data.utils import get_person_model

# ALREADY_LOADED_ERROR_MESSAGE = """
# If you need to reload the child data from the csv file, then ADD EXPLANATION"""


def get_model_fields(required_columns):
    def replace(x):
        if x == "5års_aldersgrupper":
            return "fem_års_aldersgrupper"
        elif x == "10års_aldersgrupper":
            return "ti_års_aldersgrupper"
        else:
            return x

    return list(map(replace, required_columns))


def get_required_columns(year):
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
    ]

    match year:
        case 1801:
            required_columns.append("stilling_i_husstanden_original")
        case 1850:
            required_columns.extend(
                [
                    "fødested_original",
                    "fødesogn_by_standardiseret",
                    "migrant_type",
                ]
            )
        case 1901:
            required_columns.extend(
                [
                    "stilling_i_husstanden_original",
                    "fødested_original",
                    "fødesogn_by_standardiseret",
                    "migrant_type",
                ]
            )
    return required_columns


def get_year(file_name):
    if "1801" in file_name:
        return 1801
    elif "1850" in file_name:
        return 1850
    elif "1901" in file_name:
        return 1901
    else:
        raise Exception("Either 1801, 1850 or 1901 should appear in the file name")


def get_values(model_fields, required_columns, row):
    value_dict = {}
    for field, req_col in zip(model_fields, required_columns):
        value_dict.update({field: row[req_col]})
    return value_dict


def validate_columns(required_columns, dict_reader):
    for req_col in required_columns:
        if req_col not in dict_reader.fieldnames:
            raise Exception(
                f"A required column is missing from the uploaded CSV: '{req_col}'"
            )


def upload_dataset(file_name):
    dict_reader = DictReader(open(file_name), delimiter="$")
    year = get_year(file_name)
    required_columns = get_required_columns(year)
    ## in model_fields, "5års_aldersgrupper" and "10års_aldersgrupper" are replaced with "fem_års_aldersgrupper" and "ti_års_aldersgrupper" since python otherwise gets angry when dealing with variables starting with a number
    model_fields = get_model_fields(required_columns)
    person = get_person_model(year)

    validate_columns(required_columns, dict_reader)

    print("Uploading csv file: ", file_name)
    data = []
    invalid_age_count = 0
    for i, row in tqdm(enumerate(dict_reader, start=1)):
        values = get_values(model_fields, required_columns, row)
        new_person = person(**values)

        # is the invalid_age stuff still important?
        if int(new_person.alder) >= 0:
            data.append(new_person)
        else:
            invalid_age_count += 1

        if len(data) > 500:
            person.objects.bulk_create(data, ignore_conflicts=True)
            data = []

        # for testing purposes don't use all data
        # if i > 10000:
        #     break

    if data:
        person.objects.bulk_create(data)
    print("invalid age count for year {}: {}".format(year, invalid_age_count))


class Command(BaseCommand):
    # Show this when the user types help
    help = "Loads data from ft1801, ft1850, ft1901 csv files"

    def handle(self, *args, **options):
        if (
            Person1801.objects.exists()
            or Person1850.objects.exists()
            or Person1901.objects.exists()
        ):
            print("One or more of datasets already uploaded.")
            return

        datasets = [
            "ft1801_dataekspeditioner_20230123.csv",
            "ft1850_dataekspeditioner_20230123.csv",
            "ft1901_dataekspeditioner_20230123.csv",
        ]

        # Show this before loading the data into the database
        print("Loading datasets")

        for file_name in datasets:
            upload_dataset("./datasets/" + file_name)

        print("All datasets successfully uploaded")
