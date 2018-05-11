from . import gameplay

# todo:
# include depth in minimax tree scores

class Node:
  def __init__(self, p1, p2, table, turn, depth = 0):
    self.p1 = p1 # p1 hand
    self.p2 = p2 # p2 hand
    self.turn = turn # who's turn is it?
    self.table = table # current table
    self.score = 0 # p1 wants a score of 100. p2 wants a score of -100. 
    self.children = [] # all possible next plays

    self.depth = depth # for testing for now

  def set_children(self):
    # if the game is won, set the score to 100 or -100 depending on who won, and return
    if not self.p1:
      self.score = 100
      return
    elif not self.p2:
      self.score = -100
      return

    # generate all possibilities given hand and table
    possibilities = gameplay.possibilities(self.p1 if self.turn == 'p1' else self.p2, self.table)
    # if no possibilities (player passes), set children equal to all possibilities of the other player on a blank table
    if not possibilities:
      self.table = []
      possibilities = gameplay.possibilities(self.p2 if self.turn == 'p1' else self.p1, self.table)
      self.turn = 'p2' if self.turn == 'p1' else 'p1'

    # iterate through all possibilities, and add then as children nodes
    for possibility in possibilities:
      # update p1, p2
      if self.turn == 'p1':
        p1 = [i for i in self.p1 if i not in possibility]
        p2 = self.p2
      elif self.turn == 'p2':
        p1 = self.p1
        p2 = [i for i in self.p2 if i not in possibility]
      self.children.append(Node(p1, p2, possibility, 'p1' if self.turn == 'p2' else 'p2', self.depth + 1))
    # recursively populate children's children with minimaxed scores
    for i in self.children:
      i.set_children()
      # set the score to the possible winning score of the next depth
      if i.score > 0:
        self.score = i.score - self.depth
      elif i.score < 0:
        self.score = i.score + self.depth

  def count_nodes(self):      
    # print('depth', self.depth, 'p1', self.p1, 'p2', self.p2, 'turn', self.turn, 'table', self.table, 'score', self.score)
    # print(' -- done -- ')
    count = 1
    for i in self.children:
      count += i.count_nodes()
    return count
