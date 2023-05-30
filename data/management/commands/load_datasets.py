from csv import DictReader
from django.core.management import BaseCommand
from data.models import Person
from tqdm import tqdm

ALREADY_LOADED_ERROR_MESSAGE = """
If you need to reload the child data from the csv file, then ADD EXPLANATION"""


def upload_dataset(file_name):
    dict_reader = DictReader(open(file_name), delimiter="$")

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

    # print("dict_reader.fieldnames: \n {}".format(dict_reader.fieldnames))
    for req_col in required_columns:
        if req_col not in dict_reader.fieldnames:
            raise Exception(
                f"A required column is missing from the uploaded CSV: '{req_col}'"
            )

    print("Uploading csv file: ", file_name)
    if "1801" in file_name:
        year = 1801
    elif "1850" in file_name:
        year = 1850
    elif "1901" in file_name:
        year = 1901
    else:
        raise Exception("Either 1801, 1850 or 1901 should appear in the file name")

    # print("year is: ", year)
    # total=len(list(dict_reader)
    # print("total len:", len(dict_reader.fieldnames))

    data = []
    invalid_age_count = 0
    for row, item in tqdm(enumerate(dict_reader, start=1)):
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

        if int(new_person.alder) >= 0:
            data.append(new_person)
        else:
            invalid_age_count += 1
            # if invalid_age_count % 100 == 0:
            #     print("invalid age count incremented, it is now: ", invalid_age_count)

        if len(data) > 500:
            Person.objects.bulk_create(data, ignore_conflicts=True)
            data = []

    if data:
        Person.objects.bulk_create(data)
        # self.process_item(item)
    print("invalid age count for year {}: {}".format(year, invalid_age_count))


class Command(BaseCommand):
    # Show this when the user types help
    help = "Loads data from ft1801, ft1850, ft1901 csv files"

    def handle(self, *args, **options):
        if Person.objects.exists():
            print("Datasets already loaded")
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
