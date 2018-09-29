import mysql.connector
from mysql.connector import Error
import getpass

hostDb = 'rds-mysql-huguesp.col4kuvwn0jf.eu-west-3.rds.amazonaws.com'
nameDb = 'coquinaria'
userDb = 'pierre'


def connect(passwordDb):
    """ Connect to the database that contains the recipes."""
    try:
        print('Attempting to connect to {}'.format(hostDb))
        conn = mysql.connector.connect(host=hostDb,
                                       database=nameDb,
                                       user=userDb,
                                       password=passwordDb)
        if conn.is_connected():
            print('Connected to the database.')
    except Error as e:
        print(e)
    finally:
        print('Attempting to disconnect from {}'.format(hostDb))
        conn.close()
        print('Disconnected')

password = getpass.getpass('What is the password of the account ?\n')

connect(password)
