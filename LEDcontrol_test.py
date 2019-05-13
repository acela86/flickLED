# -*- coding: utf-8 -*-

from PIL import Image
from matplotlib import pylab as plt

import threading
import time

showrate = 1

"""
Virtual LED Matrix Class
"""
class controller(threading.Thread):
    fig = plt.figure()
    background_color = (0, 0, 0)
    blightness = 1.0
    count = showrate - 1

    def __init__(self, rows, chain_length, brightness):
        self._img = Image.new('RGB', (rows * chain_length, rows), (0, 0, 0))
        self.ax = plt.imshow(self._img)
        
        self.stop_event = threading.Event()
        self.update_event = threading.Event()

        threading.Thread.__init__(self)
    
    @property
    def img(self):
        return self._img
    
    @img.setter
    def img(self, img):
        self._img = img
        self.count += 1
        if (self.count == showrate):
            self.ax.set_data(self._img)
            self.count = 0
    
    def run(self):
        return

def wait(seconds):
    plt.pause(seconds/2)
