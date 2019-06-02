#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import io

import LEDdata

type_LEDs = LEDdata.get_type_LEDs()

# Make a type list for a drum roll
out = 'Content-type: text/html\n\n'
out += '<li value="" class="type_utl"></li>'
for i, type_LED in enumerate(type_LEDs):
    out += '<li value="%s" class="type_%s">' % (type_LED[1], type_LED[2])
    out += '<img src="%s" id="%d">' % (type_LED[0], i)
    out += '</li>\n'

print(out)
