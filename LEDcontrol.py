# -*- coding: utf-8 -*-

from PIL import Image
from rgbmatrix import RGBMatrix, RGBMatrixOptions

import threading
import time

class controller(threading.Thread):
    """A Class to show a image to a LED matrix.

    Attributes:
        img: An image to show in the LED matrix.
        stop_event: A flag to terminate the control loop.
        update_event: A flag to update an image to show.
    """

    def setRGBData(self, rgb_im):
        """Set Imge data to the LED matrix.

        Args:
            rgb_im: a PIL RGB image
        """
        self.matrix.SetImage(rgb_im)
    
    def __init__(self, rows, chain_length, brightness):
        """Initialize a LED matrix.

        Args:
            rows: The numberof matrix rows (usually 32 or 64).
            chain_length: The number of daisy-chained panels.
            brightness: LED brightness (0-100).
        """
        # LED control options
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
        """Run a control loop."""
        while not self.stop_event.is_set():
            self.update_event.wait(3)
            if (self.update_event.is_set()):
                self.update_event.clear()
                self.setRGBData(self.img)
        
        self.matrix.Clear()

def wait(seconds):
    """Wait for specified seconds.

    Args:
        seconds: Time to wait.
    """
    time.sleep(seconds)
