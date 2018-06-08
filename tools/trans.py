#!/usr/bin/python
# -*-coding:utf-8-*-
import os, glob, re, io
import xml.dom.minidom
import sys, json
reload(sys)
sys.setdefaultencoding("utf-8")


#--------------------------------------------------

re_line = re.compile('^\t(.*)\t(\d*)\t(\d*)\t(\d*)$')
re_end = re.compile('^(\d*)\t(\d*\.?\d*)\t(\d*)\t(\d*)\t$')

#--------------------------------------------------

def dealWith(file_in, file_out):
    out_obj = {}
    out_time = "0"
    with io.open(file_in, 'r') as file:
        for line in file:
            r_l = re_line.match(line)
            if r_l:
                # print r_l.group(1), r_l.group(2), r_l.group(3), r_l.group(4)
                item = [r_l.group(3), r_l.group(4)]
                if r_l.group(2) in out_obj:
                    out_obj[r_l.group(2)].append(item)
                else:
                    out_obj[r_l.group(2)] = [item]
                continue
            r_e = re_end.match(line)
            if r_e:
                # print r_e.group(1), r_e.group(2), r_e.group(3), r_e.group(4)
                out_time = r_e.group(1)
                continue
    out_items = sorted(out_obj.items(), cmp = lambda x, y: cmp(int(x[0]), int(y[0])), reverse=False)
    with open(file_out, 'w') as file:
        is_first = True
        file.write('{"frames":[')
        for key, value in out_items:
            if is_first:
                is_first = False
            else:
                file.write(',')
            file.write('[' + key)
            for line in value:
                file.write(',[' + line[0] + ',' + line[1] + ']')
            file.write(']')
        file.write('],"time":' + out_time + '}')
    print 'success'

dealWith('music.txt', 'music.json')
