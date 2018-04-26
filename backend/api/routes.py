from django.shortcuts import render

# Create your views here.

from django.http import JsonResponse
from . import models
import json

def index(request):
  print('you succesuflly got the endpoint, printing data...')
  if request.method == 'POST':
    print(json.loads(request.body))
  return JsonResponse({ 'response': 'a json response' })
def test(request):
  print('you got the test route')
  return JsonResponse({ 'response': 'test' })

def allGames(req):
  return JsonResponse({ 'res': models.allGames() })
def newGame(req):
  req = json.loads(req.body)
  print(req)
  return JsonResponse({ 'res': models.newGame(req['name'], req['player']) })