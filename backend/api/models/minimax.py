from . import gameplay

class Node:
  def __init__(self, p1, p2, table, turn, depth = 0):
    self.p1 = p1 # p1 hand
    self.p2 = p2 # p2 hand
    self.turn = turn # who's turn is it?
    self.table = table # current table
    self.score = 0 # p1 wants a score of 100. p2 wants a score of -100. 
    self.children = [] # all possible next plays

    self.depth = depth # for testing for now

def set_children(node):
  # if the game is won, set the score to 100 or -100 depending on who won, and return
  if not node.p1:
    node.score = 100
    return
  elif not node.p2:
    node.score = -100
    return

  # generate all possibilities given hand and table
  possibilities = gameplay.possibilities(node.p1 if node.turn == 'p1' else node.p2, node.table)
  # if no possibilities (player passes), set children equal to all possibilities of the other player on a blank table
  if not possibilities:
    node.table = []
    possibilities = gameplay.possibilities(node.p2 if node.turn == 'p1' else node.p1, node.table)
    node.turn = 'p2' if node.turn == 'p1' else 'p1'

  # iterate through all possibilities, and add then as children nodes
  for possibility in possibilities:
    # update p1, p2
    if node.turn == 'p1':
      p1 = [i for i in node.p1 if i not in possibility]
      p2 = node.p2
    elif node.turn == 'p2':
      p1 = node.p1
      p2 = [i for i in node.p2 if i not in possibility]
    node.children.append(Node(p1, p2, possibility, 'p1' if node.turn == 'p2' else 'p2', node.depth + 1))
  # recursively populate children's children with minimaxed scores
  for i in node.children:
    set_children(i)
    # set the score to the largest/smallest score, prioritizing less depth over more depth
    new_score = (i.score - 1) if i.score > 0 else (i.score + 1)
    if node.turn == 'p1' and new_score > node.score or node.turn == 'p2' and new_score < node.score:
      node.score = new_score

def count_nodes(node):
  # print('depth', node.depth, 'p1', node.p1, 'p2', node.p2, 'turn', node.turn, 'table', node.table, 'score', node.score)
  # print(' -- done -- ')
  count = 1
  for i in node.children:
    count += count_nodes(i)
  return count

def select_best_hand_to_play(p1, p2, table, turn):
  minimax_tree = Node(p1, p2, table, turn)
  set_children(minimax_tree)

  # print('# nodes:', count_nodes(minimax_tree))
  # print('table:', minimax_tree.table)

  # if terminal node, or player must pass, play nothing
  if not minimax_tree.children or minimax_tree.turn != turn:
    # print('pass')
    return []

  # otherwise, use minimax scoring system to determine the best hand to play
  if minimax_tree.turn == 'p1':
    current_hand = minimax_tree.p1
    new_hand = max(minimax_tree.children, key = lambda x: x.score).p1
  elif minimax_tree.turn == 'p2':
    current_hand = minimax_tree.p2
    new_hand = max(minimax_tree.children, key = lambda x: x.score).p2
  return [i for i in current_hand if i not in new_hand]
  