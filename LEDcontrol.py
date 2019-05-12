# -*- coding: utf-8 -*-

from PIL import Image
from rgbmatrix import RGBMatrix, RGBMatrixOptions

import threading
import time

"""
LED Matrix Control Class
"""
class controller(threading.Thread):
    def setRGBData(self, rgb_im):
        self.matrix.SetImage(rgb_im)
    
    def __init__(self, rows, chain_length, brightness):
        options = RGBMatrixOptions()
        options.rows = rows
        options.chain_length = chain_length
        options.parallel = 1
        options.hardware_mapping = 'adafruit-hat'
        options.brightness = brightness
        
        self.matrix = RGBMatrix(options = options)
        self.img = Image.new('RGB', (rows * chain_length, rows), (0, 0, 0))
        
        self.stop_event = threading.Event()
        self.update_event = threading.Event()

        threading.Thread.__init__(self)
        
    def run(self):
        while not self.stop_event.is_set():
            self.update_event.wait(3)
            if (self.update_event.is_set()):
                self.update_event.clear()
                self.setRGBData(self.img)
        
        self.matrix.Clear()

def wait(seconds):
    time.sleep(seconds)
