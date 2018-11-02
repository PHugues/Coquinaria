#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import mysql.connector
from mysql.connector import Error
from configparser import ConfigParser


def read_conf(filename='config.ini', section='mysql'):
    """ Read the file that contains the configuration for the
    database and return a dictionnary.
    :param filename: the name of the file
    :param section: the section of the configuration
    :return: a dictionnary of parameters
    """
    parser = ConfigParser()
    parser.read(filename)

    db = {}
    if parser.has_section(section):
        items = parser.items(section)
        for item in items:
            db[item[0]] = item[1]
    else:
        raise Exception('{} not found in the file {}.'
                        .format(section, filename))
    return db


def connect(userDb, passwordDb):
    """ Connect to the database that contains the recipes.
    :param userDb: name of the user attempting to connect
    :param passwordDb: password of the user
    :return: the connection to the database
    """
    try:
        db_conf = read_conf()
        hostDb = db_conf['hostdb']
        nameDb = db_conf['namedb']
        print('Attempting to connect to {}.'.format(hostDb))
        conn = mysql.connector.connect(host=hostDb,
                                       database=nameDb,
                                       user=userDb,
                                       password=passwordDb)
        if conn.is_connected():
            print('Connected to the database, welcome {}.'.format(
                userDb.capitalize()))
            return conn
    except Error as e:
        print(e)


def disconnect(conn):
    """ Disconnect from the database.
    :param: the connection to the database
    """
    try:
        print('Attempting to disconnect from the database.')
        conn.close()
        if conn.is_connected() is False:
            print('Disconnected from the database.')
    except Error as e:
        print(e)
