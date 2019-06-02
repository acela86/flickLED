#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import io

import LEDdata

dest_LEDs = LEDdata.get_dest_LEDs()

# Make a destination list for a drum roll
out = 'Content-type: text/html\n\n'
out += '<li value=""></li>'
for i, dest_LED in enumerate(dest_LEDs):
    out += '<li value="%s">' % dest_LED[1]
    out += '<img src="%s" id="%d" class="dest_utl">' % (dest_LED[0]['utl'][0], i)
    out += '<img src="%s" id="%d" class="dest_ssl">' % (dest_LED[0]['ssl'][0], i)
    out += '</li>\n'

print(out)
