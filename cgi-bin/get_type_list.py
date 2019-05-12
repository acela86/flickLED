#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import io
#import codecs
#sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
#sys.stdout = codecs.getwriter('utf-8')(sys.stdout)

import LEDdata

type_LEDs = LEDdata.get_type_LEDs()

out = 'Content-type: text/html\n\n'
#out += '<ul>\n'
out += '<li value="" class="type_utl"></li>'
for i, type_LED in enumerate(type_LEDs):
    out += '<li value="%s" class="type_%s">' % (type_LED[1], type_LED[2])
    out += '<img src="%s" id="%d">' % (type_LED[0], i)
    out += '</li>\n'
#out += '</ul>\n'

print(out)
