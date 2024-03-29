import psycopg2
import pickle
import re
from get_docker_secret import get_docker_secret
import os
from face_api import is_match
from post_api import predict
from googletrans import Translator

# Google Translate API pentru a traduce textele in engleza
translator = Translator()


def create_database_connection():
    connection = psycopg2.connect(user=get_docker_secret(os.environ['DATABASE_USER']),
                                  password=get_docker_secret(
                                      os.environ['DATABASE_PASSWORD']),
                                  host="database",
                                  port="5432",
                                  database=get_docker_secret(os.environ['DATABASE_DB']))

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


def insert_books(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql = ("INSERT INTO books (user_id, name, created_time) VALUES (%s, %s, %s)")
    vals = [(user_id, book['name'], book['created_time'])
            for book in data['books']]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def insert_movies(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql = ("INSERT INTO movies (user_id, name, created_time) VALUES (%s, %s, %s)")
    vals = [(user_id, movie['name'], movie['created_time'])
            for movie in data['movies']]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def insert_groups(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql = ("INSERT INTO groups (user_id, name, created_time) VALUES (%s, %s, %s)")
    vals = [(user_id, group['name'], group['created_time'])
            for group in data['groups']]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def insert_likes(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql = ("INSERT INTO likes (user_id, name, created_time) VALUES (%s, %s, %s)")
    vals = [(user_id, like['name'], like['created_time'])
            for like in data['likes']]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def insert_accounts(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql = ("INSERT INTO accounts (user_id, name) VALUES (%s, %s)")
    vals = [(user_id, account['name'])
            for account in data['accounts']]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def insert_favorite_athletes(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql = ("INSERT INTO favorite_athletes (user_id, name) VALUES (%s, %s)")
    vals = [(user_id, athlete['name'])
            for athlete in data['profile']['favorite_athletes']]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def insert_favorite_teams(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql = ("INSERT INTO favorite_teams (user_id, name) VALUES (%s, %s)")
    vals = [(user_id, team['name'])
            for team in data['profile']['favorite_teams']]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def insert_languages(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql = ("INSERT INTO languages (user_id, name) VALUES (%s, %s)")
    vals = [(user_id, language['name'])
            for language in data['profile']['languages']]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def get_face(connection, id):
    cursor = connection.cursor()

    sql = ("SELECT images.path, faces.x, faces.y, faces.width, faces.height FROM faces JOIN images ON faces.image_id = images.id WHERE faces.id = %s")
    val = (id, )

    try:
        cursor.execute(sql, val)
        connection.commit()

        return cursor.fetchone()
    except:
        connection.rollback()
        return None


def get_image_id(connection, id):
    cursor = connection.cursor()

    sql = ("SELECT image_id FROM faces WHERE id = %s")
    val = (id, )

    try:
        cursor.execute(sql, val)
        connection.commit()

        return cursor.fetchone()[0]
    except:
        connection.rollback()
        return None


def get_faces(connection, image_id):
    cursor = connection.cursor()

    sql = ("SELECT id, x, y, width, height FROM faces WHERE image_id = %s")
    val = (image_id, )

    try:
        cursor.execute(sql, val)
        connection.commit()

        return cursor.fetchall()
    except:
        connection.rollback()
        return None


def insert_known_persons(connection, persons, user_id):
    cursor = connection.cursor()

    sql = ("SELECT id, embedding FROM persons")
    sql_images = ("SELECT id FROM images WHERE path = %s")
    sql_insert = (
        "INSERT INTO faces (person_id, image_id, x, y, width, height) VALUES (%s, %s, %s, %s, %s, %s)")

    try:
        cursor.execute(sql)
        connection.commit()

        db_persons = cursor.fetchall()

        rest_persons = []

        for person in persons:
            db_person_match = None

            for db_person in db_persons:
                if is_match(person['embedding'], pickle.loads(db_person[1]), 0.5):
                    print('match')
                    db_person_match = db_person
                    break

            if db_person_match != None:
                for face in person['faces']:
                    image_id = 0

                    try:
                        val_images = (face['filename'], )
                        cursor.execute(sql_images, val_images)
                        connection.commit()

                        image_id = cursor.fetchone()[0]
                    except:
                        connection.rollback()
                        continue

                    val_insert = (
                        db_person[0], image_id, face['x'], face['y'], face['width'], face['height'])

                    try:
                        cursor.execute(sql_insert, val_insert)
                        connection.commit()
                    except:
                        connection.rollback()
                        continue
                pass
            else:
                rest_persons.append(person)

        return rest_persons

    except Exception as e:
        print(f'error {str(e)}')
        connection.rollback()
        return persons


def get_subject_id(subjects, subject_name):
    for id, name in subjects:
        if name == subject_name:
            return id


def insert_posts(connection, data):
    user_id = data['profile']['id']

    cursor = connection.cursor()

    sql_subject_id = ("SELECT id, name FROM post_types")
    subjects = []

    try:
        cursor.execute(sql_subject_id)
        connection.commit()
        subjects = cursor.fetchall()
    except:
        connection.rollback()

    sql = ("INSERT INTO posts (user_id, post_type, message, created_time) VALUES (%s, %s, %s, %s)")
    vals = [(user_id, get_subject_id(subjects, predict(translator.translate(post['message'], dest='en').text)), post['message'], post['created_time'])
            for post in data['posts'] if 'message' in post]

    try:
        cursor.executemany(sql, vals)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def set_ready(connection, user_id):
    cursor = connection.cursor()

    sql = ("UPDATE users SET ready = true WHERE id = %s")
    val = (user_id,)

    try:
        cursor.execute(sql, val)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def get_traffic_path(connection, id):
    cursor = connection.cursor()

    sql = ("SELECT path FROM traffic_signs WHERE id = %s")
    val = (id, )

    try:
        cursor.execute(sql, val)
        connection.commit()

        return cursor.fetchone()
    except:
        connection.rollback()
        return None


def get_maze(connection, id):
    cursor = connection.cursor()

    sql = ("SELECT path FROM mazes WHERE id = %s")
    val = (id, )

    try:
        cursor.execute(sql, val)
        connection.commit()

        return cursor.fetchone()
    except:
        connection.rollback()
        return None


def get_traffic_light(connection, id):
    cursor = connection.cursor()

    sql = ("SELECT path FROM traffic_lights WHERE id = %s")
    val = (id, )

    try:
        cursor.execute(sql, val)
        connection.commit()

        return cursor.fetchone()
    except:
        connection.rollback()
        return None


def get_animal_path(connection, id):
    cursor = connection.cursor()

    sql = ("SELECT path FROM animals WHERE id = %s")
    val = (id, )

    try:
        cursor.execute(sql, val)
        connection.commit()

        return cursor.fetchone()
    except:
        connection.rollback()
        return None


def get_dice_path(connection, id):
    cursor = connection.cursor()

    sql = ("SELECT path FROM dices WHERE id = %s")
    val = (id, )

    try:
        cursor.execute(sql, val)
        connection.commit()

        return cursor.fetchone()
    except:
        connection.rollback()
        return None


def get_first_name(connection, id):
    cursor = connection.cursor()

    sql = ("SELECT first_name FROM users WHERE id = %s")
    val = (id, )

    try:
        cursor.execute(sql, val)
        connection.commit()

        return cursor.fetchone()
    except:
        connection.rollback()
        return None


def set_correct_clock(connection, path, correct):
    cursor = connection.cursor()

    sql = ("UPDATE answers_clock SET correct = %s WHERE path = %s")
    val = (correct, path)

    try:
        cursor.execute(sql, val)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()


def set_correct_polygon(connection, path, correct):
    cursor = connection.cursor()

    sql = ("UPDATE answers_polygon SET correct = %s WHERE path = %s")
    val = (correct, path)

    try:
        cursor.execute(sql, val)
        connection.commit()
    except:
        connection.rollback()

    cursor.close()
