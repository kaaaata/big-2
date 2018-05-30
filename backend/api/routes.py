from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from api.models import data
from api.models import gameplay
from api.models import ai
import json

# models/data.py
def allGames(req):
  return JsonResponse({ 'res': data.allGames() })
@csrf_exempt
def newGame(req):
  return JsonResponse({ 'res': data.newGame(json.loads(req.body)) })
@csrf_exempt
def joinGame(req):
  return JsonResponse({ 'res': data.joinGame(json.loads(req.body)) })
  
def fetchInstruction(req):
  return JsonResponse({ 'res': data.fetchInstruction(req.GET.get('game_id')) })
@csrf_exempt
def sendInstruction(req):
  return JsonResponse({ 'res': data.sendInstruction(json.loads(req.body)) })

@csrf_exempt
def stayAlive(req):
  return JsonResponse({ 'res': data.stayAlive(json.loads(req.body)) })

# models/gameplay.py
@csrf_exempt
def validPlay(req):
  request = json.loads(req.body)
  # print(request)
  # print(gameplay.validPlay(request))
  # return JsonResponse({ 'res': True }) # always true condition for development
  return JsonResponse({ 'res': gameplay.validPlay(json.loads(req.body)) })

# models/ai.py
def selectBestHandToPlay(req):
  return JsonResponse({ 'res': ai.selectBestHandToPlay(json.loads(req.GET.get('hand')), json.loads(req.GET.get('table')), json.loads(req.GET.get('opponentCards')), int(req.GET.get('aggression'))) })
