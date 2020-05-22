from facebook_collector import facebook_collect, is_a_valid_facebook_profile
from file_system import save_posts_images, save_albums_photos
from face_api import get_persons
from flask import Flask, request, Response, make_response, send_file
from utils import get_all_image_paths, get_all_images, same_word
from threading import Lock
import database
import cv2
import base64

app = Flask(__name__)

# Conexiunea la baza de date
db_connection = database.create_database_connection()

# Lock global pentru accesul la o sectiune critica
lock = Lock()


@app.route('/users/validate', methods=['POST'])
def validate_users():
    """Verifica existenta unui profil facebook valid"""

    try:
        # Extrag access-token-ul din cerere
        token = request.args.get('token')

        if token == None:
            return Response("False", status=400, mimetype='application/json')

        # Extrag id-ul din cerere
        id = request.args.get('id')

        if id == None:
            return Response("False", status=400, mimetype='application/json')

        if is_a_valid_facebook_profile(token, id):
            return Response("True", status=200, mimetype='application/json')
        else:
            return Response("False", status=200, mimetype='application/json')

    except:
        return Response("False", status=200, mimetype='application/json')


@app.route('/users', methods=['POST'])
def index():
    """Adaugarea unui nou utilizator in sistem"""

    try:
        lock.acquire()

        # Extrag access-token-ul din cerere
        token = request.args.get('token')

        # Colectez datele din profilul utilizatorului
        try:
            data = facebook_collect(token)
        except:
            return Response("Facebook data collecting failed!", status=500, mimetype='application/json')

        # Salveaza imaginile asociate postarilor (pe disk)
        save_posts_images(data)

        # Salveaza pozele din albume (pe disk)
        save_albums_photos(data)

        # Salvez profilul utilizatorului
        database.insert_profile(db_connection, data['profile'])

        # Adaug aprecierile muzicale
        database.insert_music(db_connection, data)

        # Adauga jocurile apreciate
        database.insert_games(db_connection, data)

        # Adauga cartile apreciate
        database.insert_books(db_connection, data)

        # Adauga filmele apreciate
        database.insert_movies(db_connection, data)

        # Adauga grupurile din care utilizatorul face parte
        database.insert_groups(db_connection, data)

        # Adauga paginile apreciate de catre utilizator
        database.insert_likes(db_connection, data)

        # Adauga paginile administrate de catre utilizator
        database.insert_accounts(db_connection, data)

        # Adauga atletii apreciati de catre utilizator
        database.insert_favorite_athletes(db_connection, data)

        # Adauga echipele sportive apreciate de catre utilizator
        database.insert_favorite_teams(db_connection, data)

        # Adauga limbile cunoscute de catre utilizator
        database.insert_languages(db_connection, data)

        # Adauga postarile care contin mesaj
        database.insert_posts(db_connection, data)

        # Extrage toate imaginile (cu created_time)
        images = get_all_images(data)

        # Extrage caile catre toate pozele
        all_image_paths = get_all_image_paths(data)

        # Adauga toate imaginile in baza de date
        database.insert_images(db_connection, images,
                               int(data['profile']['id']))

        # Detectez persoanele din imagini
        persons = get_persons(all_image_paths)

        # Incearca potrivirea persoanelor noi cu cele deja existente
        persons_rest = database.insert_known_persons(
            db_connection, persons, data['profile']['id'])

        # Adauga persoanele noi in baza de date
        database.insert_persons(
            db_connection, persons_rest, data['profile']['id'])

        # Marcheaza contul drept "ready" - datele au fost procesate
        database.set_ready(db_connection, data['profile']['id'])

        return Response("Successfully created", status=201, mimetype='application/json')
    except:
        return Response.status_code(500)
    finally:
        lock.release()

    return Response.status_code(201)


@app.route('/face/<id>', methods=['GET'])
def get_face(id):
    """
    Intoarce imaginea care contine fata cu id-ul <id>,
    cu un bounding box care scoate in evidenta fata respectiva
    """

    # Aduce detaliile despre fata si imagine din baza de date
    face = database.get_face(db_connection, id)

    # Daca fata nu a fost gasita
    if face == None:
        return Response(f"Face with id {id} not found.", status=401, mimetype='application/json')

    path, x, y, width, height = face

    # Aduce imaginea in memorie
    image = cv2.imread(path)

    # Adauga bounding box
    cv2.rectangle(image, (x, y), (x + width, y + height), (76, 231, 255), 4)

    # Encodeaza imaginea pentru a o putea trimite
    retval, buffer = cv2.imencode('.png', image)
    response = base64.b64encode(buffer)

    # Trimite imaginea
    return response


@app.route('/words', methods=['GET'])
def words():
    """Verifica daca doua cuvinte sunt la fel (dar scrise gresit)"""

    try:
        # Extrag cuvintele din cerere
        word1 = request.args.get('word1')
        word2 = request.args.get('word2')

        if word1 == None or word2 == None:
            return Response("False", status=400, mimetype='application/json')

        if same_word(word1, word2):
            return Response("True", status=200, mimetype='application/json')
        else:
            return Response("False", status=200, mimetype='application/json')

    except:
        return Response("False", status=200, mimetype='application/json')


@app.route('/words_accuracy', methods=['GET'])
def common_words_accuracy():
    """Calculeaza precizia dintre doua liste de cuvinte (raspunsuri la common words)"""

    try:
        # Extrag cuvintele din cerere
        target = request.args.get('target')
        guessed = request.args.get('guessed')

        if target == None or guessed == None:
            return Response("False", status=400, mimetype='application/json')

        target_words = target.split(",")
        guessed_words = guessed.split(",")

        count = 0

        for target_word in target_words:
            for guessed_word in guessed_words:
                if same_word(target_word, guessed_word):
                    count += 1
                    guessed_words.remove(guessed_word)
                    break

        return Response(str(count / len(target_words)), status=200, mimetype='application/json')
    except:
        return Response("False", status=200, mimetype='application/json')


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
