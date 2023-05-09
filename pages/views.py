from django.views.generic import TemplateView
from django.db.models import Q, Count
from data.models import Person
import json
import time

# Create your views here.


class HomePageView(TemplateView):
    template_name = "home.html"


class ChartView(TemplateView):
    template_name = "chart.html"

    def get_context_data(self, **kwargs):
        chart_global_start = time.time()
        context = super().get_context_data(**kwargs)

        d1 = (
            Person.objects.values("bostedstype", "år")
            .annotate(total=Count("id"))
            .order_by()
        )

        d1850 = {}
        d1901 = {}
        d1list = list(d1)

        for x in d1list:
            if x.get("år") == 1850:
                b = x.get("bostedstype")
                d1850[b] = x.get("total")
            else:
                b = x.get("bostedstype")
                d1901[b] = x.get("total")

        keys, values1850 = zip(*d1850.items())
        _, values1901 = zip(*d1901.items())

        context["labels"] = json.dumps(keys)
        context["data1"] = json.dumps(values1850)
        context["data2"] = json.dumps(values1901)

        statuses = (
            Person.objects.values(
                "år", "fem_års_aldersgrupper", "ægteskabelig_stilling"
            )
            .annotate(total=Count("id"))
            .order_by()
        )

        status_list = list(statuses)

        def sorting_key(elem):
            if "-" in elem:
                return int(elem.split("-")[0])
            elif "+" in elem:
                return int(elem.split("+")[0])

        age_labels = sorted(
            list(
                set(
                    [
                        item.get("fem_års_aldersgrupper")
                        for item in status_list
                        if item.get("fem_års_aldersgrupper") != "-1"
                    ]
                )
            ),
            # key=lambda x: int(x.split("-")[0]),
            key=sorting_key,
        )

        def get_percentages(group):
            total = sum([item.get("total") for item in group])
            gift = [
                item.get("total") / total
                for item in group
                if item.get("ægteskabelig_stilling") == "gift"
            ]
            ugift = [
                item.get("total") / total
                for item in group
                if item.get("ægteskabelig_stilling") == "ugift"
            ]
            skilt = [
                item.get("total") / total
                for item in group
                if item.get("ægteskabelig_stilling") == "skilt"
            ]
            enke = [
                item.get("total") / total
                for item in group
                if item.get("ægteskabelig_stilling") == "enke"
            ]
            ukendt = [
                item.get("total") / total
                for item in group
                if item.get("ægteskabelig_stilling") == "ukendt"
            ]
            get_number = lambda p_list: 0 if not p_list else p_list[0]
            return (
                get_number(gift),
                get_number(ugift),
                get_number(skilt),
                get_number(enke),
                get_number(ukendt),
            )

        final1850 = []
        final1901 = []

        for age in age_labels:
            group1850 = [
                item
                for item in status_list
                if item.get("fem_års_aldersgrupper") == age and item.get("år") == 1850
            ]
            group1901 = [
                item
                for item in status_list
                if item.get("fem_års_aldersgrupper") == age and item.get("år") == 1901
            ]
            final1850.append(get_percentages(group1850))
            final1901.append(get_percentages(group1901))

        final1850 = list(zip(*final1850))
        final1901 = list(zip(*final1901))

        context["labels2"] = json.dumps(age_labels)
        context["data1850"] = json.dumps(final1850)
        context["data1901"] = json.dumps(final1901)

        return context
