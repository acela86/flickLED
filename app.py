#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import six
import threading
import json
from PIL import Image

from BaseHTTPServer import HTTPServer
import SocketServer as socketserver
from CGIHTTPServer import CGIHTTPRequestHandler
from Queue import Queue

sys.path.append('./cgi-bin')

# Switch LED control class
# (Linux:Real, Otherwise:Virtual)
if (os.name == 'posix'):
    posix = True
    import LEDcontrol as LEDcontrol
else:
    posix = False
    import LEDcontrol_test as LEDcontrol

# LED data
import LEDdata
type_LEDs = LEDdata.get_type_LEDs()
dest_LEDs = LEDdata.get_dest_LEDs()

# LED parameters
rows = 32
chain_length = 4
brightness = 50

# Showing parameters
background_color = (0, 0, 0)
interval = 0.1
time_chg = 3.0

xpos = {}
xpos['type'] = 0
xpos['dest'] = 48

def get_image_array(type_idx, dest_idx):
    """Get an image array from type and destination indices.

    Destination images change according to the line of the type (utl or ssl).

    Args:
        type_idx: A type index starting from 1 (sent by a browser).
        dest_idx: A destination index starting from 1 (sent by a browser).
    
    Returns:
        A dictionary storing images to show.
        Its keys are "type" and "dest", which correspond to keys in xpos.

        dict['type'] = (RGBTypeImage,)
        dict['dest'] = (RGBDestinationImage, RGBLineImage)
    """
    images = {}
    
    # Load type image and line
    if (type_idx > 0):
        type_LED = type_LEDs[type_idx - 1]
        images['type'] = (LEDdata.load_image(type_LED[0]),)
        
        line = type_LED[2]
        line_text = type_LED[1]
    else:
        line = 'utl'
        line_text = ''
    
    # Load destination images related to line
    if (dest_idx > 0):
        dest_LED = dest_LEDs[dest_idx - 1]
        images['dest'] = (LEDdata.load_image(dest_LED[0][line][0]), LEDdata.load_image(dest_LED[0][line][1]))
        dest_text = dest_LED[1]
    else:
        dest_text = ''
    
    print('%s | %s' % (line_text, dest_text))
    return images

def get_LED_image(images, indexes):
    """Get image to show in LED.

    Args:
        images: An image dictionary given by get_image_array.
        indexes: An index dictionary to choose an image from the array to show.
    
    Returns:
        An composed image.
    """
    im = Image.new('RGB', (rows * chain_length, rows), background_color)
    for k in indexes:
        if (not k in xpos):
            continue
        if (not k in images):
            continue
        else:
            idx = indexes[k]
        im.paste(images[k][idx], (xpos[k], 0))
    
    return im

class cgi_http_handler(CGIHTTPRequestHandler):
    """CGI handler to process a command sent from a browser."""
    def __init__(self, request, client_address, server):
        """Constructor."""
        CGIHTTPRequestHandler.__init__(self, request, client_address, server)
    
    def do_POST(self):
        """Process a command."""
        # Receive new command
        content_len = int(self.headers.get('content-length'))
        requestBody = self.rfile.read(content_len).decode('UTF-8')
        jsonData = json.loads(requestBody)

        # Add command and queue
        self.server.q.put(jsonData)

        # Send acknowledge of command
        self.send_response(100)
        self.send_header('Content-type', 'text/html')

        return

class threaded_http_server(socketserver.ThreadingMixIn, HTTPServer):
    pass

if __name__ == '__main__':
    # Initialize queue
    q = Queue()
    q.put({'type':1, 'dest':1})
    
    # Initialize LED control thread
    LED_controller_thread = LEDcontrol.controller(rows, chain_length, brightness)
    LED_controller_thread.background_color = background_color
    LED_controller_thread.start()
    
    # Initialize HTTP server
    server = threaded_http_server(('', 8000), cgi_http_handler) 
    server.q = q
    ip, port = server.server_address
    
    server_thread = threading.Thread(target = server.serve_forever)
    server_thread.setDaemon(True)
    server_thread.start()
    
    # Main loop
    try:
        print('Press Ctrl-C to exit')
        while (True):
            # Receive new command
            if (not q.empty()):
                data = q.get()
                images = get_image_array(data['type'], data['dest'])
                timer = 0
                idx = {}
                for k in images.keys():
                    idx[k] = 0
                LED_controller_thread.img = get_LED_image(images, idx)
                LED_controller_thread.update_event.set()
            
            # Show and switch images
            timer += 1
            if (timer >= (time_chg / interval)):
                timer = 0
                for k in idx.keys():
                    idx[k] += 1
                    if (idx[k] == len(images[k])):
                        idx[k] = 0
                LED_controller_thread.img = get_LED_image(images, idx)
                LED_controller_thread.update_event.set()
            
            LEDcontrol.wait(interval)
    except KeyboardInterrupt:
        pass
    finally:
        LED_controller_thread.stop_event.set()
        server.shutdown()

    # Terminate    
    LED_controller_thread.join()
    server_thread.join()
