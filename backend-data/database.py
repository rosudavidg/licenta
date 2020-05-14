import psycopg2


def create_database_connection():
    connection = psycopg2.connect(user="backend",
                                  password="this-is-my-SuP3r-S3Cre7-p4ssword",
                                  host="database",
                                  port="5432",
                                  database="avatario_db")

    return connection


def close_connection(connection):
    connection.close()


def insert_person(connection, embedding):
    cursor = connection.cursor()

    sql = ("INSERT INTO persons (embedding) VALUES (%s)")
    val = (embedding,)

    cursor.execute(sql, val)

    connection.commit()

    cursor.close()
