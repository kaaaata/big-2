from django.http import JsonResponse
from . import models
import json

def index(request):
  print('you succesuflly got the endpoint, printing data...')
  if request.method == 'POST':
    print(json.loads(request.body))
  return JsonResponse({ 'response': 'a json response' })

def allGames(req):
  return JsonResponse({ 'res': models.allGames() })
def newGame(req):
  req = json.loads(req.body)
  return JsonResponse({ 'res': models.newGame(req) })
  
def fetchInstruction(req):
  req = json.loads(req.body)
  return JsonResponse({ 'res': models.fetchInstruction(req) })
def sendInstruction(req):
  req = json.loads(req.body)
  return JsonResponse({ 'res': models.sendInstruction(req) })

def stayAlive(req):
  req = json.loads(req.body)
  return JsonResponse({ 'res': models.stayAlive(req) })
