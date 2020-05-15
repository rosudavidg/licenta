import psycopg2
import pickle


def create_database_connection():
    connection = psycopg2.connect(user="backend",
                                  password="this-is-my-SuP3r-S3Cre7-p4ssword",
                                  host="database",
                                  port="5432",
                                  database="avatario_db")

    return connection


def close_connection(connection):
    connection.close()


def insert_persons(connection, persons, user_id):
    cursor = connection.cursor()

    sql_persons = ("INSERT INTO persons (embedding) VALUES (%s) RETURNING id")
    sql_face = (
        "INSERT INTO faces (person_id, image_id, x, y, width, height) VALUES (%s, %s, %s, %s, %s, %s)")
    sql_images = ("SELECT id FROM images WHERE path = %s")

    for person in persons:
        val_persons = (pickle.dumps(person['embedding']), )

        try:
            cursor.execute(sql_persons, val_persons)
            connection.commit()
        except:
            connection.rollback()

        person_id = cursor.fetchone()[0]

        try:
            for face in person['faces']:
                image_id = 0

                try:
                    val_images = (face['filename'], )
                    cursor.execute(sql_images, val_images)
                    connection.commit()

                    image_id = cursor.fetchone()[0]
                except:
                    connection.rollback()

                val_face = (person_id, image_id,
                            face['x'], face['y'], face['width'], face['height'])
                cursor.execute(sql_face, val_face)
            connection.commit()
        except:
            connection.rollback()

    cursor.close()


def insert_images(connection, images, user_id):
    cursor = connection.cursor()

    sql = ("INSERT INTO images (id, user_id, path, created_time) VALUES (%s, %s, %s, %s)")
    vals = [(int(image[0].split('/')[3]), user_id, image[0], image[1])
            for image in images]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()
