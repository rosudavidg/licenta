from facebook_collector import facebook_collect, is_a_valid_facebook_profile, facebook_prefetch
from file_system import save_posts_images, save_albums_photos, save_profile_picture, create_new_dir
from face_api import get_persons
from clock_api import is_correct_clock
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


@app.route('/users/prefetch', methods=['POST'])
def prefetch():
    """Pregatire pentru aducerea datelor"""

    try:
        # Extrag access-token-ul din cerere
        token = request.args.get('token')

        # Prefetech data
        data = facebook_prefetch(token)

        # Adaugare director utilizator
        create_new_dir(data)

        # Salveaza imaginea de profil (dimensiunea mica)
        save_profile_picture(data)

        # Salvez profilul utilizatorului
        database.insert_profile(db_connection, data['profile'])

    except:
        return Response("Internal error", status=500, mimetype='application/json')

    return Response("Successfully created", status=201, mimetype='application/json')


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

    # Extrage id-ul imaginii
    image_id = database.get_image_id(db_connection, id)

    # Extrage toate fetele care apar in imagine
    faces = database.get_faces(db_connection, image_id)

    # Daca fata nu a fost gasita
    if face == None:
        return Response(f"Face with id {id} not found.", status=401, mimetype='application/json')

    path, x, y, width, height = face

    # Aduce imaginea in memorie
    image = cv2.imread(path)

    # Extrage dimensiunile pozei
    image_h, image_w, _ = image.shape

    # Calculez dimensiunile cropului
    crop_x_start, crop_y_start, crop_x_stop, crop_y_stop = [
        0, 0, image_w - 1, image_h - 1]

    for f_id, f_x, f_y, f_w, f_h in faces:
        if f_id != id:
            if f_x > x + width and f_x < crop_x_stop:
                crop_x_stop = f_x
            if f_x + f_w < x and f_x + f_w > crop_x_start:
                crop_x_start = f_x + f_w
            if f_y > y + height and f_y < crop_y_stop:
                crop_y_stop = f_y
            if f_y + f_h < y and f_y + f_h > crop_y_start:
                crop_y_start = f_y + f_h
            if f_x + f_w > x + width and f_x <= x + width:
                crop_x_stop = x + width
            if f_x < x and f_x + f_w >= x:
                crop_x_start = x
            if f_y + f_h > y + height and f_y <= y + height:
                crop_y_stop = y + height
            if f_y < y and f_y + f_h >= y:
                crop_y_start = y

    # Adauga bounding box
    cv2.rectangle(image, (x, y), (x + width, y + height), (76, 231, 255), 4)

    # Croparea imaginii
    image = image[crop_y_start:crop_y_stop, crop_x_start:crop_x_stop]

    # Encodeaza imaginea pentru a o putea trimite
    retval, buffer = cv2.imencode('.png', image)
    response = base64.b64encode(buffer)

    # Trimite imaginea
    return response


@app.route('/profilepic/<id>', methods=['GET'])
def get_profilepic(id):
    """
    Intoarce profilepic al utilizatorului cu id-ul id
    """

    # Aduce imaginea in memorie
    image = cv2.imread(f'/images/{id}/profilepic.jpg')

    # Encodeaza imaginea pentru a o putea trimite
    retval, buffer = cv2.imencode('.jpg', image)
    response = base64.b64encode(buffer)

    # Trimite imaginea
    return response


@app.route('/firstname/<id>', methods=['GET'])
def get_first_name(id):
    """
    Intoarce prenumele utilizatorului
    """

    return database.get_first_name(db_connection, id)[0]


@app.route('/traffic-sign/<id>', methods=['GET'])
def get_traffic_sign(id):
    """
    Intoarce indicatorul
    """

    path = database.get_traffic_path(db_connection, id)

    # Aduce imaginea in memorie
    image = cv2.imread(path[0], cv2.IMREAD_UNCHANGED)

    # Encodeaza imaginea pentru a o putea trimite
    retval, buffer = cv2.imencode('.png', image)
    response = base64.b64encode(buffer)

    # Trimite imaginea
    return response


@app.route('/traffic-light/<id>', methods=['GET'])
def get_traffic_light(id):
    """
    Intoarce semaforul
    """

    path = database.get_traffic_light(db_connection, id)

    # Aduce imaginea in memorie
    image = cv2.imread(path[0], cv2.IMREAD_UNCHANGED)

    # Encodeaza imaginea pentru a o putea trimite
    retval, buffer = cv2.imencode('.jpg', image)
    response = base64.b64encode(buffer)

    # Trimite imaginea
    return response


@app.route('/animal/<id>', methods=['GET'])
def get_animal(id):
    """
    Intoarce animalul
    """

    path = database.get_animal_path(db_connection, id)

    # Aduce imaginea in memorie
    image = cv2.imread(path[0], cv2.IMREAD_UNCHANGED)

    # Encodeaza imaginea pentru a o putea trimite
    retval, buffer = cv2.imencode('.jpg', image)
    response = base64.b64encode(buffer)

    # Trimite imaginea
    return response


@app.route('/dice/<id>', methods=['GET'])
def get_dice(id):
    """
    Intoarce zarul
    """

    path = database.get_dice_path(db_connection, id)

    # Aduce imaginea in memorie
    image = cv2.imread(path[0], cv2.IMREAD_UNCHANGED)

    # Encodeaza imaginea pentru a o putea trimite
    retval, buffer = cv2.imencode('.png', image)
    response = base64.b64encode(buffer)

    # Trimite imaginea
    return response


@app.route('/clock', methods=['POST'])
def post_clock():
    """
    Adauga un desen cu un ceas
    """

    try:
        buffer = request.get_json()['img']
        path = request.args.get('path')

        buffer_decoded = base64.b64decode(buffer[22:])

        with open(path, 'wb') as out:
            out.write(buffer_decoded)

        # Verifica daca ceasul este corect sau nu si actualizeaza baza de date
        correct = is_correct_clock(path)
        database.set_correct_clock(db_connection, path, correct)

        return Response("Created", status=201, mimetype='application/json')

    except Exception as e:
        print(e)

        return Response("Failed", status=500, mimetype='application/json')


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


@app.route('/matching_tag', methods=['GET'])
def matching_tag():
    """Verifica daca un cuvant se afla intr-o alta lista de cuvinte"""

    try:
        # Extrag cuvintele din cerere
        tags = request.args.get('tags')
        word = request.args.get('word')

        if tags == None or word == None:
            return Response("False", status=400, mimetype='application/json')

        # Extrag tag-urile
        tags_words = tags.split(",")

        # Calculez potrivirile
        same_words = [same_word(tag, word) for tag in tags_words]

        if (any(same_words)):
            return Response("True", status=200, mimetype='application/json')

        return Response("False", status=200, mimetype='application/json')
    except:
        return Response("False", status=200, mimetype='application/json')


@app.route('/status', methods=['GET'])
def status():
    return Response("Server is running!", status=200, mimetype='application/json')


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
