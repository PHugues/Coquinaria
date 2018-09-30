#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import getpass
import dbconfig

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
