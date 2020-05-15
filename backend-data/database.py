import psycopg2
import pickle
import re


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


def insert_profile(connection, profile):
    user_id = profile['id']

    email = None
    first_name = None
    last_name = None
    location = None
    gender = None
    birthday = None
    hometown = None

    try:
        email = profile['email']
    except:
        pass
    try:
        first_name = profile['first_name']
    except:
        pass
    try:
        last_name = profile['last_name']
    except:
        pass
    try:
        location = profile['location']['name']
    except:
        pass
    try:
        gender = profile['gender']
    except:
        pass
    try:
        birthday = profile['birthday']
    except:
        pass
    try:
        hometown = profile['hometown']['name']
    except:
        pass

    cursor = connection.cursor()

    sql = ("UPDATE users SET email = %s, first_name = %s, last_name = %s, location = %s, gender = %s, birthday = %s, hometown = %s, id = %s")
    val = (email, first_name, last_name, location,
           gender, birthday, hometown, user_id)

    try:
        cursor.execute(sql, val)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def insert_music(connection, data):
    cursor = connection.cursor()

    sql_genres = ("SELECT * FROM music_genres")
    sql_insert = (
        "INSERT INTO users_music_genres (user_id, music_genre_id, name, created_time) VALUES (%s, %s, %s, %s)")

    try:
        cursor.execute(sql_genres)
        connection.commit()
    except:
        connection.rollback()
        return

    music_genres = cursor.fetchall()

    user_id = data['profile']['id']
    music = data['music']

    for e in music:
        for genre in music_genres:
            genre_tags = list(filter(lambda x: len(
                x) > 0, re.split(',| ', genre[2])))

            e_tags = list(filter(lambda x: len(x) > 0, list(
                map(lambda x: x.lower(), re.split(' |&|,|-|/', e['genre'])))))

            if len(set(genre_tags).intersection(set(e_tags))) > 0:
                val = (user_id, genre[0], e['name'], e['created_time'])

                try:
                    cursor.execute(sql_insert, val)
                    connection.commit()
                except:
                    connection.rollback()
    cursor.close()


def insert_games(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql = ("INSERT INTO games (user_id, name, created_time) VALUES (%s, %s, %s)")
    vals = [(user_id, game['name'], game['created_time'])
            for game in data['games']]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()
