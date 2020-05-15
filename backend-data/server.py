from facebook_collector import facebook_collect
from file_system import save_posts_images, save_albums_photos
from face_api import get_persons
from flask import Flask, request, Response
from utils import get_all_image_paths, get_all_images
import pickle
import database

app = Flask(__name__)

db_connection = database.create_database_connection()


@app.route('/users', methods=['POST'])
def index():
    """Adaugarea unui nou utilizator in sistem"""

    try:
        # Extrag access-token-ul din cerere
        token = request.args.get('token')

        # Colectez datele din profilul utilizatorului
        data = facebook_collect(token)

        # Salveaza imaginile asociate postarilor
        # save_posts_images(data)

        # Salveaza pozele din albume
        # save_albums_photos(data)

        # Extrage caile catre toate pozele
        all_image_paths = get_all_image_paths(data)

        # Extrage toate imaginile (cu created_time)
        images = get_all_images(data)

        # Adauga toate imaginile in baza de date
        database.insert_images(db_connection, images,
                               int(data['profile']['id']))

        # Detectez persoanele din imagini
        persons = get_persons(all_image_paths)

        # TODO: verifica persoanele deja existente (elimina din persons + adauga faces in DB)

        # Adauga persoanele noi in baza de date
        database.insert_persons(db_connection, persons, data['profile']['id'])

        # TODO: salveaza metadatele in baza de date

        return Response("Successfully created", status=201, mimetype='application/json')

    except:
        return Response.status_code(500)

    return Response.status_code(201)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
