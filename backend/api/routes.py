from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
import json

def index(request):
  print('you succesuflly got the endpoint, printing data...')
  if request.method == 'POST':
    print(json.loads(request.body))
  return JsonResponse({ 'response': 'a json response' })
def test(request):
  print('you got the test route')
  return JsonResponse({ 'response': 'a test response' })