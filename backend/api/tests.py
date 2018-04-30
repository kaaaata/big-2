# TestCase for with database, SimpleTestCase for without database
from django.test import SimpleTestCase

from api.models import ai

class aiTestCase(SimpleTestCase):
  def setUp(self):
    ai._ai()

  def test_1x2x3x4x_and_5x(self):
    test_ai = ai._ai()
    self.assertEqual(test_ai.wins, [])
    print('--> AI class got initialized')

    self.assertEqual(test_ai.all1x2x3x4x([30, 41, 52], 1), [[30], [41], [52]])
    print('--> all1x2x3x4x works for 1')
    self.assertEqual(test_ai.all1x2x3x4x([30, 31, 40, 41], 2), [[30, 31], [40, 41]])
    print('--> all1x2x3x4x works for 2')
    self.assertEqual(test_ai.all1x2x3x4x([30, 31, 33, 41, 42, 43], 3), [[30, 31, 33], [41, 42, 43]])
    print('--> all1x2x3x4x works for 3')
    self.assertEqual(test_ai.all1x2x3x4x([30, 31, 32, 33], 4), [[30, 31, 32, 33]])
    print('--> all1x2x3x4x works for 4 (without extra card)')

    self.assertEqual(test_ai.all5x([30, 31, 32, 33, 41, 51], '4x'), [[30, 31, 32, 33, 41], [30, 31, 32, 33, 51]])
    print('--> all5x works for 4x')
    self.assertEqual(test_ai.all5x([30, 31, 32, 41, 42, 51, 53], 'full house'), [[41, 42, 30, 31, 32], [51, 53, 30, 31, 32]])
    print('--> all5x works for full house')
    self.assertEqual(test_ai.all5x([30, 31, 42, 53, 60, 71], 'straight'), [[30, 42, 53, 60, 71], [31, 42, 53, 60, 71]])
    print('--> all5x works for straight')
    self.assertEqual(test_ai.all5x([31, 41, 61, 62, 71, 81, 91], 'flush'), [[31, 41, 61, 71, 81], [31, 41, 61, 71, 91]])
    print('--> all5x works for flush (bottom 4 as fodder)')
    self.assertEqual(test_ai.all5x([31, 41, 51, 61, 71, 81, 92], 'straight flush'), [[31, 41, 51, 61, 71], [41, 51, 61, 71, 81]])
    print('--> all5x works for straight flush')

  def test_possibilities(self):
    test_ai = ai._ai()
    self.assertEqual(True, True)
    print('--> True')
    