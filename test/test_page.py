#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import unittest

from selenium import webdriver


class NewVisitorTest(unittest.TestCase):
    def setUp(self):
        self.browser = webdriver.Chrome()

    def tearDown(self):
        self.browser.quit()

    def test_can_start_a_list_and_retrieve_it_later(self):
        self.browser.get('http://localhost:5000')
        self.assertIn('Token', self.browser.title)
        self.fail('Finish the test!')


if __name__ == '__main__':
    unittest.main(warnings='ignore')
