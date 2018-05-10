# py stores algorithms pertaining to gameplay logic. there is no shared data here.

from random import shuffle

def generateRandomDeck():
    deck = [i for i in list(range(30, 154)) if i % 10 <= 3]
    shuffle(deck)
    return deck

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
  
  ranks = [i // 10 for i in hand] # rank only i.e. [14, 14, 14, 14]
  suits = [i % 10 for i in hand] # suit only i.e. [0, 1, 2, 3]

  if len(hand) == 1:
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
  
def pokerPower(hand, ranks, suits):
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

def rankCount(card, array):
  return len([i for i in array if i // 10 == card // 10])
  
def allCombinations(a, size):
  # given an (a)rray of cards, return all combinations with 'size' length (not permutations)
  # allCombinations([1, 2, 3], 2) => [[1, 2], [1, 3], [2, 3]]
  # CONSTANT TIME for 2 <= a <= 4 !!

  if len(a) <= 2:
    if size == 2:
      return [a]
  elif len(a) == 3:
    if size == 2:
      return [[a[0], a[1]], [a[0], a[2]], [a[1], a[2]]]
    elif size == 3:
      return [a]
  elif len(a) == 4:
    if size == 2:
      return [[a[0], a[1]], [a[0], a[2]], [a[0], a[3]], [a[1], a[2]], [a[1], a[3]], [a[2], a[3]]]
    elif size == 3:
      return [[a[0], a[1], a[2]], [a[0], a[1], a[3]], [a[0], a[2], a[3]], [a[1], a[2], a[3]]]
    elif size == 4:
      return [a]
  else:
    return []

def all1x2x3x4x(hand, x):
  # get all possible singles, pairs, triplets, or fours (x = 1, 2, 3, 4)

  ret = []

  if x == 1:
    ret = [[i] for i in hand]
  else:
    # 1. filter out singles, pairs, if necessary.
    filter_unplayables = [i for i in hand if rankCount(i, hand) >= x]
    if filter_unplayables == []: # end immediately if no playable hands
      return []
    # 2. partition by rank [[x, x], [x, x]]
    partition_ranks = [[filter_unplayables[0]]]
    for i in range(1, len(filter_unplayables)):
      if filter_unplayables[i] // 10 == partition_ranks[len(partition_ranks) - 1][0] // 10:
        partition_ranks[len(partition_ranks) - 1].append(filter_unplayables[i])
      else:
        partition_ranks.append([filter_unplayables[i]])
    # 3. add all perms in each rank division
    for partition in partition_ranks:
      ret += allCombinations(partition, x)
  # 4. finish

  return ret if x == 4 else sorted(ret, key = lambda i: parseHand(i)['power'])

def all5x(hand, x):
  # get straight flushes, four of a kinds, full houses, flushes, and straights

  if len(hand) < 5: # end immediately if no playable hands
    return []

  def rank(card):
    return card // 10
  def suit(card):
    return card % 10

  ret = []
  ranks = [rank(i) for i in hand]

  if x == '4x':
    # 1. get all fours
    fours = all1x2x3x4x(hand, 4) # like [[x, x, x, x]]
    # 2. for each four, add a single of every other rank
    for four in fours:
      for i in hand:
        if rank(i) != rank(four[0]):
          ret.append(four + [i])
  elif x == 'full house':
    # 1. get all pairs and triplets
    pairs = all1x2x3x4x(hand, 2)
    triplets = all1x2x3x4x(hand, 3)
    # 2. for each pair, add a triplet of every other rank
    for pair in pairs:
      for trip in triplets:
        if rank(trip[0]) != rank(pair[0]):
          ret.append(pair + trip)
  else:
    # generate flushes and straights without returning. the intersection of these will be straight flushes
    # 1. generate all flushes with unique max rank with lowest 4 as fodder
    flushes = []
    for _suit in range(4):
      filter_suit = [i for i in hand if suit(i) == _suit]
      if len(filter_suit) < 5:
        continue
      for flush_max_card in filter_suit[4:]:
        flushes.append(filter_suit[:4] + [flush_max_card])
    # 2. generate all straights
    straights = []
    for i in range(len(hand)):
      if (rank(hand[i]) + 1 in ranks) and (rank(hand[i]) + 2 in ranks) and (rank(hand[i]) + 3 in ranks) and (rank(hand[i]) + 4 in ranks):
        new_straights = [[hand[i]]]
        additions = []
        for next_rank in [1, 2, 3, 4]:
          all_next_rank = [j for j in hand if rank(j) == ranks[i] + next_rank]
          for next_rank_card in all_next_rank:
            for straight in new_straights:
              additions.append(straight + [next_rank_card])
          new_straights = additions
          additions = []
        straights += [straight for straight in new_straights if len(straight) == 5]
    # 3. generate all straight flushes
    # note: can't do [straight for straight in straights if straight in flushes] because flushes doesn't contain every single flush
    straight_flushes = [straight for straight in straights if allEqual([suit(i) for i in straight])]
    # 4. prepare to return
    if x == 'straight':
      ret = [straight for straight in straights if straight not in straight_flushes]
    elif x == 'flush':
      ret = [flush for flush in flushes if flush not in straight_flushes]
    elif x == 'straight flush':
      ret = straight_flushes
  # 4. finish
  return sorted(ret, key = lambda i: parseHand(i)['power'])

def possibilities(hand, table):
  # given a hand and a table, return all possible valid combinations to play to the table

  ret = []
  table = parseHand(table)

  # 1. add all possibilities (algorithm generates no duplicates)
  if not table:
    # what hands the AI will play first is determined in the weight() method.
    # the order is as below, although the below has no bearing on the actual order.
    ret += all5x(hand, 'straight')
    ret += all1x2x3x4x(hand, 2)
    ret += all1x2x3x4x(hand, 1)
    ret += all1x2x3x4x(hand, 3)
    ret += all5x(hand, 'full house')
    ret += all5x(hand, 'flush')
    ret += all5x(hand, '4x')
    ret += all5x(hand, 'straight flush')
    return ret
  elif table['combo'] in ['1x', '2x', '3x']:
    return [i for i in all1x2x3x4x(hand, int(table['combo'][0])) if parseHand(i)['power'] > table['power']]
  elif table['combo'] == '5x':
    if table['power'] < 2000:
      ret += all5x(hand, 'straight')
    if table['power'] < 3000:
      ret += all5x(hand, 'flush')
    if table['power'] < 4000:
      ret += all5x(hand, 'full house')
    if table['power'] < 5000:
      ret += all5x(hand, '4x')
    if table['power'] < 6000:
      ret += all5x(hand, 'straight flush') # ai will always add straight flush.
    return [i for i in ret if parseHand(i)['power'] > table['power']]
