# TestCase for with database, SimpleTestCase for without database
from django.test import SimpleTestCase

from api.models import ai

class aiTestCase(SimpleTestCase):
  def setUp(self):
    ai._ai()

  def test_ai(self):
    test_ai = ai._ai()
    self.assertEqual(test_ai.wins, [])
    print('--> AI class got initialized')
    self.assertEqual(test_ai.all1x2x3x4x([140, 141], 1), [[140], [141]])
    print('--> 1x2x3x4x works')
    