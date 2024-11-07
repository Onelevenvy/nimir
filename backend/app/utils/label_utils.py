# -*- coding: utf-8 -*-
import random
import time


def rand_hex_color(current_colors=[]):
    random.seed(time.time())
    r = lambda: random.randint(0, 255)
    while True:
        c = "#%02X%02X%02X" % (r(), r(), r())
        c = c.upper()
        if c not in current_colors:
            break
    return c


def camel2snake(string):
    """
    convert camel case to snake case
    """
    if string is None:
        return None
    new_string = ""
    for c in string:
        if c >= "A" and c <= "Z":
            new_string += "_" + c.lower()
        else:
            new_string += c
    return new_string


def parse_order_by(modal, order_by):
    order_by = order_by.split(" ")
    if len(order_by) == 2:
        key, sort_dir = order_by
        # print(key, sort_dir)
        if "asc" in sort_dir:
            sort_dir = "asc"
        else:
            sort_dir = "desc"
    else:
        key = order_by[0]
        sort_dir = "acs"
    key = camel2snake(key)

    try:
        order = getattr(getattr(modal, key), sort_dir)()
    except:
        order = modal.created.asc()
    return order
