from django.http import JsonResponse
from api.models import data
from api.models import gameplay
import json

# models/data.py
def allGames(req):
  return JsonResponse({ 'res': data.allGames() })
def newGame(req):
  req = json.loads(req.body)
  return JsonResponse({ 'res': data.newGame(req) })
  
def fetchInstruction(req):
  req = json.loads(req.body)
  return JsonResponse({ 'res': data.fetchInstruction(req) })
def sendInstruction(req):
  req = json.loads(req.body)
  return JsonResponse({ 'res': data.sendInstruction(req) })

def stayAlive(req):
  req = json.loads(req.body)
  return JsonResponse({ 'res': data.stayAlive(req) })

# models/gameplay.py
def validPlay(req):
  req = json.loads(req.body)
  print(req)
  print(gameplay.validPlay(req))
  return JsonResponse({ 'res': gameplay.validPlay(req) })
