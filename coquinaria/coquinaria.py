#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import getpass
import dbconfig
import os
import sys

os.chdir(os.path.dirname(os.path.abspath(sys.argv[0])))
user = input('What is the name of the user ?\n')
password = getpass.getpass('What is the password of the account ?\n')

database = dbconfig.connect(user, password)

#
#
#

if database is not None:
    dbconfig.disconnect(database)
else:
    print('Database not connected.')
