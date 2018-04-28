from django.http import JsonResponse
from api.models import data
from api.models import gameplay
import json

# models/data.py
def allGames(req):
  return JsonResponse({ 'res': data.allGames() })
def newGame(req):
  return JsonResponse({ 'res': data.newGame(json.loads(req.body)) })
  
def fetchInstruction(req):
  return JsonResponse({ 'res': data.fetchInstruction(json.loads(req.body)) })
def sendInstruction(req):
  return JsonResponse({ 'res': data.sendInstruction(json.loads(req.body)) })

def stayAlive(req):
  return JsonResponse({ 'res': data.stayAlive(json.loads(req.body)) })

# models/gameplay.py
def validPlay(req):
  print(req)
  print(gameplay.validPlay(req))
  return JsonResponse({ 'res': gameplay.validPlay(json.loads(req.body)) })
