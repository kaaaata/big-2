# gameplay.py stores algorithms pertaining to gameplay logic. there is no shared data here.

def validPlay(play):
  cards = parseHand(play['cards'])
  table = parseHand(play['table']) if play['table'] else None

  if table == None and cards:
    return True
  elif cards == None:
    return False
  else:
    return cards['combo'] == table['combo'] and cards['power'] > table['power']

def parseHand(hand):
  # take hand like [140, 141, 142, 143] i.e. [A♦, A♣, A♥, A♠], and return { combo: '5x', power: 143 }, null if invalid

  # if !hand[0]: # not sure if this edge case will be needed
  #   return None;

  ranks = [i // 10 for i in hand] # rank only i.e. [14, 14, 14, 14]
  suits = [i % 10 for i in hand] # suit only i.e. [0, 1, 2, 3]

  if len(hand) <= 1:
    return { 'combo': '1x', 'power': hand[0] }
  elif len(hand) == 2 and allEqual(ranks):
    return { 'combo': '2x', 'power': hand[1] }
  elif len(hand) == 3 and allEqual(ranks):
    return { 'combo': '3x', 'power': hand[2] }
  elif len(hand) == 5:
    power = pokerPower(hand, ranks, suits)
    return { 'combo': '5x', 'power': power } if power else None
  else:
    return None
  
def pokerPower(hand, rank, suits):
  # Inputs: hand [120, 121] ranks [12, 12] suits [1, 2]
  # Output: power
  # 1. straight: +1000 power (JQKA2 is highest, 23456 is lowest)
  # 2. flush: +2000 power
  # 3. full house: +3000 power
  # 4. four of a kind + 1: +4000 power
  # 5. straight flush: +5000 power

  straight = allConsecutive(ranks)
  flush = allEqual(suits)

  if straight and flush:
    return 5000 + (hand[3] if ranks[4] == 15 and ranks[3] == 14 else hand[4]) # (JQKA2 is highest, 23456 is lowest)
  elif allEqual(ranks[:4]) or allEqual(ranks[1:]):
    return 4000 + (ranks[0] if allEqual(ranks[:4]) else ranks[4])
  elif (allEqual(ranks[:3]) and allEqual(ranks[3:])) or (allEqual(ranks[:2]) and allEqual(ranks[2:])):
    return 3000 + (hand[2] if allEqual(ranks[:3]) else hand[4])
  elif flush:
    return 2000 + ranks[4]
  elif straight:
    return 1000 + (hand[3] if ranks[4] == 15 and ranks[3] == 14 else hand[4]) # (JQKA2 is highest, 23456 is lowest)
  else:
    return None

def allEqual(array):
  for i in array:
    if i != array[0]:
      return False
  return True

def allConsecutive(array):
  for i in range(len(array) - 1):
    if array[i] + 1 != array[i + 1]:
      return False
  return True
