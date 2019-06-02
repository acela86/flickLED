# -*- coding: utf-8 -*-

from PIL import Image
from matplotlib import pylab as plt

import threading
import time

showrate = 1

class controller(threading.Thread):
    """This class simulates a LED matrix.
    
    Attributes:
        img: An image to show in the (simulated) LED matrix.
        stop_event: A flag to terminate the control loop. *unused
        update_event: A flag to update an image to show. *unused
    """
    fig = plt.figure()
    background_color = (0, 0, 0)
    blightness = 1.0
    count = showrate - 1

    def __init__(self, rows, chain_length, brightness):
        """Initialize a LED matrix.

        Args:
            rows: The numberof matrix rows (usually 32 or 64).
            chain_length: The number of daisy-chained panels.
            brightness: LED brightness (0-100). *unused
        """
        self._img = Image.new('RGB', (rows * chain_length, rows), (0, 0, 0))
        self.ax = plt.imshow(self._img)
        
        self.stop_event = threading.Event()
        self.update_event = threading.Event()

        threading.Thread.__init__(self)
    
    @property
    def img(self):
        """Return the Image (behaving like a normal variable)."""
        return self._img
    
    @img.setter
    def img(self, img):
        """Set and plot the image. (behaving like a normal variable partly)"""
        self._img = img
        self.count += 1
        if (self.count == showrate):
            self.ax.set_data(self._img)
            self.count = 0
    
    def run(self):
        """Do nothing. (to keep compatibility with a real LED matrix)"""
        return

def wait(seconds):
    """Wait for specified seconds.

    Args:
        seconds: Time to wait. (waiting only the half to simulate faster)
    """
    plt.pause(seconds/2)
