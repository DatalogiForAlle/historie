from django.db.models import Q
from django.views.generic import ListView, TemplateView
from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader
from django.http import JsonResponse
from django.core import serializers

from .models import Person
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
            "fødested_original",
            "fødesogn_by_standardiseret",
            "migrant_type",
        ]

        print("dict_reader.fieldnames: \n {}".format(dict_reader.fieldnames))
        for req_col in required_columns:
            if req_col not in dict_reader.fieldnames:
                raise Exception(
                    f"A required column is missing from the uploaded CSV: '{req_col}'"
                )

        print("The file name should be printed below")
        print(csv_file.name)
        if "1850" in csv_file.name:
            årstal = 1850
        elif "1901" in csv_file.name:
            årstal = 1901
            print("årstal er: ", årstal)
        else:
            raise Exception("Either 1850 or 1901 should appear in the file name")
        data = []
        for row, item in enumerate(dict_reader, start=1):
            new_person = Person(
                år=årstal,
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
                fødested_original=item["fødested_original"],
                fødesogn_by_standardiseret=item["fødesogn_by_standardiseret"],
                migrant_type=item["migrant_type"],
            )

            data.append(new_person)

            if len(data) > 500:
                Person.objects.bulk_create(data)
                data = []
        if data:
            Person.objects.bulk_create(data)
            # self.process_item(item)

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


# class SearchView(TemplateView):

#     template_name = "search.html"
#     model = Person

#     def get(self, request):

#         form = SearchForm()

#         form = SearchForm()
#         context = {"form": form}
#         return render(request, "search.html", context=context)

# class SearchView(ListView):
#     paginate_by = 5
#     model = Person
#     context_object_name = "questions"
#     template_name = "search.html"

#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         get_copy = self.request.GET.copy()
#         parameters = get_copy.pop("page", True) and get_copy.urlencode()
#         context["parameters"] = parameters
#         return context

#     def get_queryset(self):
#         n = self.request.POST.get("alder")
#         print("hey")
        
#         q = (
#             Q(alder=n)
#         )

#         res = Person.objects.filter(q)
#         print("result from search view get queryset method: ", res[0])
#         print("Hey!")
        
#         return res



# def ajaxView(request):
#     if request.is_ajax and request.method == "POST":
#         form = SearchForm(request.POST)

#         if form.is_valid():
#             # instance = form.save
#             year = form.cleaned_data["year"]
#             q = Q(år=year) & Q(navn__contains="ane")
#             results = Person.objects.filter(q)[:10]
#             ser_results = serializers.serialize("json", [results])
#             return JsonResponse({"results": ser_results}, status=200)
#         else:
#             return JsonResponse({"error": form.errors}, status=400)
#     return JsonResponse({"error": ""}, status=400)


# def index(request):
#     is_cookie_set = 0
#     # Check if the session has already been created. If created, get their values and store it.
#     if 'year' in request.session:
#         print("year was in request.session")
        
#         year = request.session['year']
#         print("year is", year)
#         is_cookie_set = 1
#     else: 
#         request.session['year'] = year

#     # else:
#     #     # Store the data in the session object which can be used later
#     #     request.session['year'] = year
#     print("cookie set?: ", is_cookie_set)
#     if(request.method == 'POST'):
#         print("\n INSIDE POST")
#         # result = 0
#         # year = 0
#         if(is_cookie_set == 0): # form submission by the user
#             form = SearchForm(request.POST)
            
#             if form.is_valid():
#                 print("\n inside index form is valid")
#                 year = form.cleaned_data['year']
#                 q = Q(år=year) & Q(navn__contains="ane")
#                 fs = ["pa_id", "år", "køn", "navn"]
#                 result = Person.objects.filter(q).values(*fs)[:30]
#                 # result = Person.objects.all(year=year,age_gte=age) # filter all employees based on sex and age
#         else: # When the session has been created
#             q = Q(år=year) & Q(navn__contains="ane")
#             print("when cookieset is 1, year is: ", year)
#             fs = ["pa_id", "år", "køn", "navn"]
#             result = Person.objects.filter(q).values(*fs)[:20]
#             print("result: \n", result)
#         print("result outside if statement: ", result)
#         paginator = Paginator(result, 5) # Show 20 results per page
#         page = request.GET.get('page')
#         page_obj = paginator.get_page(page)
#         response = render(request, 'search.html',{'result':result, 'page_obj': page_obj})    
        
#         # if(is_cookie_set == 0):
#         #     request.session['year'] = year
#         return response
#     if (request.method == "GET"):
#         print("inside get method")
#         form = SearchForm()
#     return render(request,'search.html',{'form':form})


# this one works but with some drawbacks 
# def index(request):
#     if not request.method == "POST" and 'page' in request.GET:
#         if 'page_obj' in request.session:
#             request.POST = request.session['page_obj']
#             request.method = 'POST'

#     if request.method == 'POST':
#         form = SearchForm(request.POST)
#         request.session['page_obj'] = request.POST
#         if form.is_valid():
#             page_obj = form.cleaned_data.get('page_obj')
#             year = form.cleaned_data.get('year')
#             print(page_obj, year)
#             q = Q(år=year) & Q(navn__contains="ane")
#             fs = ["pa_id", "år", "køn", "navn"]
#             result = Person.objects.filter(q).values(*fs)[:30]
#             # queryset_list = CompanyRecords.objects.filter(**{f'{search_parameter}__icontains': search_query}).exclude(
#             #     company_name__isnull=True).exclude(description__isnull=True).exclude(phones__isnull=True).exclude(
#             #     emails__isnull=True)[:5]
#             page = request.GET.get('page', 1)
#             paginator = Paginator(result, 10)

#             try:
#                 page_obj = paginator.page(page)
#                 print("page_obj: ", page_obj)
#             except PageNotAnInteger:
#                 page_obj = paginator.page(1)
#             except EmptyPage:
#                 page_obj = paginator.page(paginator.num_pages)

#             return render(request, 'search.html', {'form': form, 'page_obj': page_obj})

#     else:
#         context = {
#             'form': SearchForm()
#     }
#     return render(request, 'search.html', context)




def index(request):
    persons_per_page = 5
    
    context = {}

    # query = ""
    if request.GET:
        query = request.GET.get('q').lower()
        year = request.GET.get('year')
        search_category = request.GET.get('search_category')
        print("year request is: ", year)
        print("year type is: ", type(year))
        
        context['query'] = str(query)
        context['year'] = str(year)
        context['search_category'] = str(search_category)

        q_filter = Q(år=year)

        print("query is: ", query)
        print("query type is: ", type(query))
        if search_category == "city":
            q_filter.add(Q(sogn_by=query), Q.AND)
        elif search_category == "age":
            q_filter.add(Q(alder=query), Q.AND)

       
        page_obj = Person.objects.filter(q_filter)

        fs = ["pa_id", "år", "køn", "navn"]
        
        print(page_obj.values(*fs)[:10])


        get_copy = request.GET.copy()
        parameters = get_copy.pop("page", True) and get_copy.urlencode()
        context["parameters"] = parameters
        

        page = request.GET.get('page', 1)
        paginator = Paginator(page_obj, persons_per_page)

        try:
            page_obj = paginator.page(page)
        except PageNotAnInteger:
            page_obj = paginator.page(persons_per_page)
        except EmptyPage:
            page_obj = paginator.page(paginator.num_pages)
        
        context['page_obj'] = page_obj

    return render(request, "search.html", context)
    

# class FinalSearch(ListView):
#     paginate_by = 10
#     model = Person
#     context_object_name = "person_list"
#     template_name = "search.html"

#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         name = self.request.GET.get("name")
#         year = self.request.GET.get('year')
#         context['query'] = str(name)
#         context['year'] = str(year)
#         print("context is: ", context)
#         get_copy = self.request.GET.copy()
#         parameters = get_copy.pop("page", True) and get_copy.urlencode()
#         context["parameters"] = parameters
#         print("parameters are: ", parameters)
#         return context

#     def get_queryset(self):
#         if self.request.GET:
#             name = self.request.GET.get("name")
#             year = self.request.GET.get('year')
#             print("from get_queryset, year is: ", year)
#             print("from get_queryset, navn is: ", name)

#             res = Person.objects.filter(Q(år=year) & Q(navn__icontains=name))
#             return res



# #the right one
# class SearchView(TemplateView):

#     template_name = "search.html"
#     model = Person
#     context_object_name = "search_list"
#     # paginate_by = 10

#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         get_copy = self.request.GET.copy()
#         parameters = get_copy.pop("page", True) and get_copy.urlencode()
#         context["parameters"] = parameters
#         return context


#     def get(self, request):

#         form = SearchForm()
#         context = {"form": form}

#         if 'search-post' in request.session:
#             request.POST = request.session['search-post']
#             request.method = 'POST'

#         return render(request, "search.html", context=context)

#     def post(self, request):
#         context = {}
#         form = SearchForm(request.POST)
#         request.session['search-post'] = request.POST

#         if form.is_valid():
#             year = form.cleaned_data["year"]
#             print(type(year))
#             print("this is the request: ", year)
#             # print(type(sql))
#             context["search_success"] = True
#             q = Q(år=year) & Q(navn__contains="ane")
#             context["default_display_fields"] = ["pa_id", "år", "køn", "navn",]
#             fs = ["pa_id", "år", "køn", "navn"]
#             context["results"] = Person.objects.filter(q).values(*fs)[:30]

#             default_page = 1
#             page = request.GET.get('page', default_page)
#             items_per_page = 10
#             paginator = Paginator(context['results'], items_per_page)

#             try:
#                 items_page = paginator.page(page)
#             except PageNotAnInteger:
#                 items_page = paginator.page(default_page)
#             except EmptyPage:
#                 items_page = paginator.page(paginator.num_pages)
#             context["items_page"] = items_page


            # paginator = Paginator(context["results"], 5)
            # page_number = self.request.GET.get("search.html")
            # page_obj = paginator.get_page(page_number)
            # context["page_obj"] = page_obj
            # print("look here: ", type(context["results"]))
            # for p in context["results"]:
            #     print(type(p))
            #     print(p.navn)
        #     print(context["results"])

        # context["form"] = form

        # t = loader.get_template("search.html")

        # try:
        #     response = HttpResponse(t.render(context, request))
        #     return response
        # except:
        #     response = HttpResponse(
        #         t.render({"search_error": True, "form": form}, request)
        #     )
        #     return response

# class SearchView(ListView):
#     paginate_by = 10
#     model = Person
#     context_object_name = "results"
#     template_name = "search.html"

#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         get_copy = self.request.GET.copy()
#         parameters = get_copy.pop("page", True) and get_copy.urlencode()
#         context["parameters"] = parameters
#         return context

#     def get_queryset(self):
#         year = self.request.GET.get("year")
#         q = Q(år=year) & Q(navn__contains="ane")
#         default_display_fields = ["pa_id", "år", "køn", "navn",]
        
# #             fs = ["pa_id", "år", "køn", "navn"]
#         return Person.objects.filter(q).values(*default_display_fields)[:10]