#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import io
#import codecs
#sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
#sys.stdout = codecs.getwriter('utf-8')(sys.stdout)

import LEDdata

dest_LEDs = LEDdata.get_dest_LEDs()

out = 'Content-type: text/html\n\n'
#out += '<ul>\n'
out += '<li value=""></li>'
for i, dest_LED in enumerate(dest_LEDs):
    out += '<li value="%s">' % dest_LED[1]
    out += '<img src="%s" id="%d" class="dest_utl">' % (dest_LED[0]['utl'][0], i)
    out += '<img src="%s" id="%d" class="dest_ssl">' % (dest_LED[0]['ssl'][0], i)
    out += '</li>\n'
#out += '</ul>\n'

print(out)
