from django.views.generic import TemplateView
from django.db.models import Q, Count
from data.models import Person
import json

# Create your views here.


class HomePageView(TemplateView):
    template_name = "home.html"


class ChartView(TemplateView):
    template_name = "chart.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        labels = [bosted[0] for bosted in Person.BOSTED_CHOICES]
        data = []
        print(labels)
        print(type(labels))

        for label in labels:
            data.append(Person.objects.filter(bostedstype=label).count())

        # context["labels"] = labels
        # context["data"] = data
        context["labels"] = json.dumps(labels)
        context["data"] = json.dumps(data)
        return context
