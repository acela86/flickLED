# -*- coding: utf-8 -*-

from PIL import Image
import csv

def load_image(filename):
    im = Image.open(filename)
    return im.convert('RGB')

def get_type_LEDs():
    """Get train type data.

    This function assumes that type.csv has this structure:

    Type,TypeImageFile,Line
    (e.g. 普通,local.png,utl)

    Type: A label to show in the console.
    TypeImageFile: a file name of a type image.
    Line: a line key to specify the destination image (utl or ssl).
    In an Ueno-Tokyo Line (utl) train, its destination is shown by white texts.
    In a Shonan-Shinjuku Line (ssl) train, its destination is shown by orange texts.

    Returns:
        An array consisted of a tuple as follows:
        (TypeImageURL, Type, Line)
    """
    type_LEDs = []
    
    with open('type.csv', 'r') as csvfile:
        csvreader = csv.reader(csvfile, delimiter=',', quotechar='|')
        #for row in csvreader:
        for i, row in enumerate(csvreader):
            type_LEDs.append(('./type/%s' % row[1], row[0], row[2]))
    return type_LEDs

def get_dest_LEDs():
    """Get train destination data.

    This function assumes that dest.csv has this structure:

    Destination,DestinationImageFileforUTL,LineImageFileforUTL,DestinationImageFileforSSL,LineImageFileforSSL
    (e.g. 前橋,maebashi.png,utl_via_takasaki_line.png,maebashi_ssl.png,ssl_via_takasaki_line.png)

    Destination: A label to show in the console.
    DestinationImageFileforUTL: a file name of a destination image in an Ueno-Tokyo Line train (white texts).
    LineImageFileforUTL: a file name of a line image in an Ueno-Tokyo Line train (white texts).
    DestinationImageFileforSSL: a file name of a destination image in a Shonan-Shinjuku Line train (orange texts).
    LineImageFileforSSL: a file name of a line image in a Shonan-Shinjuku Line train (orange texts).

    Returns:
        An array consisted of a tuple as follows:
        (dest_images, Destination)

        dest_images is a dictionary to store image URLs for each line.
        Its possible keys are "utl" standing for Ueno-Tokyo Line, and "ssl" standing for Shonan-Shinjuku Line.

        dest_images['utl'] = (DestinationImageURLforUTL, RouteImageURLforUTL)
        dest_images['ssl'] = (DestinationImageURLforSSL, RouteImageURLforSSL)
    """
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
