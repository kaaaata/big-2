# import TestCase for with database, SimpleTestCase for without database
from django.test import SimpleTestCase

from api.models import ai
from api.models import gameplay
from api.models import minimax

class aiTestCase(SimpleTestCase):
  def setUp(self):
    ai.Ai()

  # def test_1x2x3x4x_and_5x(self):
  #   test_ai = ai.Ai()
  #   self.assertEqual(test_ai.wins, {})
  #   print('--> AI class got initialized')

  #   self.assertEqual(gameplay.all1x2x3x4x([30, 41, 52], 1), [[30], [41], [52]])
  #   print('--> all1x2x3x4x works for 1')
  #   self.assertEqual(gameplay.all1x2x3x4x([30, 31, 40, 41], 2), [[30, 31], [40, 41]])
  #   print('--> all1x2x3x4x works for 2')
  #   self.assertEqual(gameplay.all1x2x3x4x([30, 31, 33, 41, 42, 43], 3), [[30, 31, 33], [41, 42, 43]])
  #   print('--> all1x2x3x4x works for 3')
  #   self.assertEqual(gameplay.all1x2x3x4x([30, 31, 32, 33], 4), [[30, 31, 32, 33]])
  #   print('--> all1x2x3x4x works for 4 (without extra card)')

  #   self.assertEqual(gameplay.all5x([30, 31, 32, 33, 41, 51], '4x'), [[30, 31, 32, 33, 41], [30, 31, 32, 33, 51]])
  #   print('--> all5x works for 4x')
  #   self.assertEqual(gameplay.all5x([30, 31, 32, 41, 42, 51, 53], 'full house'), [[41, 42, 30, 31, 32], [51, 53, 30, 31, 32]])
  #   print('--> all5x works for full house')
  #   self.assertEqual(gameplay.all5x([30, 31, 42, 53, 60, 71], 'straight'), [[30, 42, 53, 60, 71], [31, 42, 53, 60, 71]])
  #   print('--> all5x works for straight')
  #   self.assertEqual(gameplay.all5x([31, 41, 61, 62, 71, 81, 91], 'flush'), [[31, 41, 61, 71, 81], [31, 41, 61, 71, 91]])
  #   print('--> all5x works for flush (bottom 4 as fodder)')
  #   self.assertEqual(gameplay.all5x([31, 41, 51, 61, 71, 81, 92], 'straight flush'), [[31, 41, 51, 61, 71], [41, 51, 61, 71, 81]])
  #   print('--> all5x works for straight flush')

  # def test_possibilities(self):
  #   test_ai = ai.Ai()
  #   self.assertEqual(test_ai.wins, {})
  #   print('--> AI class got initialized')

  #   cards = [30, 41, 52, 63, 70, 73]
  #   table = []
  #   expected = [[30, 41, 52, 63, 70], [30, 41, 52, 63, 73], [70, 73], [30], [41], [52], [63], [70], [73]]
  #   self.assertEqual(gameplay.possibilities(cards, table), expected)
  #   print('--> correct possibilities generated for empty table')

  #   table = [51]
  #   expected = [[52], [63], [70], [73]]
  #   self.assertEqual(gameplay.possibilities(cards, table), expected)
  #   print('--> correct possibilities generated for 1x table')

  #   cards = [30, 31, 41, 52, 63, 70, 73]
  #   table = [40, 41]
  #   expected = [[70, 73]]
  #   self.assertEqual(gameplay.possibilities(cards, table), expected)
  #   print('--> correct possibilities generated for 2x table')

  #   cards = [30, 31, 41, 52, 63, 70, 72, 73]
  #   table = [40, 41, 42]
  #   expected = [[70, 72, 73]]
  #   self.assertEqual(gameplay.possibilities(cards, table), expected)
  #   print('--> correct possibilities generated for 3x table')

  #   cards = [31, 41, 51, 61, 71, 82, 90, 140, 141, 142, 150, 151]
  #   table = [40, 51, 62, 72, 83]
  #   expected = [[51, 61, 71, 82, 90], [31, 41, 51, 61, 141], [31, 41, 51, 61, 151], [150, 151, 140, 141, 142], [31, 41, 51, 61, 71]]
  #   self.assertEqual(gameplay.possibilities(cards, table), expected)
  #   print('--> correct possibilities generated for 5x table')

  #   cards = [31, 32, 41, 51, 61, 71, 72, 73, 82, 90, 140, 141, 142, 150, 151]
  #   table = [40]
  #   opponentCards = 10
  #   aggression = 0
  #   self.assertIsInstance(test_ai.selectBestHandToPlay(cards, table, opponentCards, aggression), list)
  #   print('--> successfully called selectBestHandToPlay and returned a list')

  # below works but takes really really long (90 seconds)
  # def test_training(self):
  #   test_ai = ai.Ai()
  #   self.assertEqual(test_ai.wins, {})
  #   print('--> AI class got initialized')

  #   training_parameters = {
  #     'repetitions': 25,
  #     'min_aggression': 0,
  #     'max_aggression': 4,
  #   }
  #   self.assertEqual(test_ai.runTraining(training_parameters), True)
  #   print('--> ai training was successful for 625 games')

  def test_minimax(self):
    # simple case
    # p1 = [31, 32]
    # p2 = [41, 81]

    # complex case
    p1 = [31, 32, 61, 62, 73, 90]
    p2 = [41, 42, 51, 52, 70, 91]
    minimax_tree = minimax.Node(p1, p2, [], 'p1')
    self.assertEqual(minimax_tree.score, 0)
    print('--> minimax tree got created')
    print('best hand to play:', minimax.select_best_hand_to_play(p1, p2, [], 'p1'))
