# -*- coding: utf-8 -*-

from PIL import Image
import csv

"""
Load image
"""
def load_image(filename):
    im = Image.open(filename)
    return im.convert('RGB')

"""
Set train type data
"""
def get_type_LEDs():
    type_LEDs = []
    
    with open('type.csv', 'r') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=',', quotechar='|')
        #for row in csvreader:
        for i, row in enumerate(csvreader):
            type_LEDs.append(('./type/%s' % row[1], row[0], row[2]))
    return type_LEDs

"""
Set train destination data
"""
def get_dest_LEDs():
    dest_LEDs = []
    
    with open('dest.csv', 'r') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=',', quotechar='|')
        for i, row in enumerate(csvreader):
            dest_images = {}
            dest_images['utl'] = ('./dest/%s' % row[1], './dest/%s' % row[2])
            dest_images['ssl'] = ('./dest/%s' % row[3], './dest/%s' % row[4])
            
            dest_LEDs.append((dest_images, row[0]))
    return dest_LEDs

if __name__ == '__main__':
    type_LEDs = get_type_LEDs()
    dest_LEDs = get_dest_LEDs()
