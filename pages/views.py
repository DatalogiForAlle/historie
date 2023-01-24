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
        context = super().get_context_data(**kwargs)
        # labels = [bosted[0] for bosted in Person.BOSTED_CHOICES]

        d1 = (
            Person.objects.values("bostedstype", "år")
            .annotate(total=Count("id"))
            .order_by()
        )

        d1850 = {}
        d1901 = {}
        # fix the dict part below to make it faster
        for x in d1:
            if x.get("år") == 1850:
                b = x.get("bostedstype")
                d1850[b] = x.get("total")
            else:
                b = x.get("bostedstype")
                d1901[b] = x.get("total")
        dict_end = time.time()

        keys, values1850 = zip(*d1850.items())
        _, values1901 = zip(*d1901.items())

        context["labels"] = json.dumps(keys)
        context["data1"] = json.dumps(values1850)
        context["data2"] = json.dumps(values1901)

        # for second chart: percentage of married people per age group, shown for both 1850 and 1901

        # this is not very robust, should be changed later
        labels2 = sorted(
            [
                x
                for x in Person.objects.values_list(
                    "fem_års_aldersgrupper", flat=True
                ).distinct()
                if x[0].isdigit()
            ],
            key=lambda x: int(x.split("-")[0]),
        )

        def get_percentages(agegroup):

            c_start = time.time()

            sol = agegroup.aggregate(
                agr_1=Count(
                    "ægteskabelig_stilling", filter=Q(ægteskabelig_stilling="gift")
                ),
                agr_2=Count(
                    "ægteskabelig_stilling", filter=Q(ægteskabelig_stilling="ugift")
                ),
                agr_3=Count(
                    "ægteskabelig_stilling", filter=Q(ægteskabelig_stilling="skilt")
                ),
                agr_4=Count(
                    "ægteskabelig_stilling", filter=Q(ægteskabelig_stilling="enke")
                ),
                agr_5=Count(
                    "ægteskabelig_stilling", filter=Q(ægteskabelig_stilling="ukendt")
                ),
            )
            c_end = time.time()
            print("agegroup aggregate takes time: ", c_end - c_start)
            total = sum(sol.values())
            if total != 0:
                p_gift = sol.get("agr_1") / total
                p_ugift = sol.get("agr_2") / total
                p_skilt = sol.get("agr_3") / total
                p_enke = sol.get("agr_4") / total
                p_ukendt = sol.get("agr_5") / total
                return (p_gift, p_ugift, p_skilt, p_enke, p_ukendt)
            else:
                return (0, 0, 0, 0, 0)

        data1850 = []
        data1901 = []
        global_start = time.time()
        for label in labels2:
            print(label)
            group1850 = Person.objects.filter(fem_års_aldersgrupper=label, år=1850)
            group1901 = Person.objects.filter(fem_års_aldersgrupper=label, år=1901)
            start = time.time()
            data1850.append(get_percentages(group1850))
            end = time.time()
            print("get percentages take time: ", (end - start))
            data1901.append(get_percentages(group1901))
        global_end = time.time()
        print("label loop takes time: ", (global_end - global_start))

        data1850 = list(zip(*data1850))
        data1901 = list(zip(*data1901))

        context["labels2"] = json.dumps(labels2)
        context["data1850"] = json.dumps(data1850)
        context["data1901"] = json.dumps(data1901)

        return context
