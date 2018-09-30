import mysql.connector
from mysql.connector import Error

hostDb = 'rds-mysql-huguesp.col4kuvwn0jf.eu-west-3.rds.amazonaws.com'
nameDb = 'coquinaria'


def connect(userDb, passwordDb):
    """ Connect to the database that contains the recipes.
    :param userDb: name of the user attempting to connect
    :param passwordDb: password of the user
    :return: the connection to the database
    """
    try:
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
        print('Attempting to disconnect from {}.'.format(hostDb))
        conn.close()
        if conn.is_connected() is False:
            print('Disconnected from the database.')
    except Error as e:
        print(e)
