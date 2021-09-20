from django.http import HttpResponse

def check(request):
    return HttpResponse('OK')
