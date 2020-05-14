from facebook_collector import facebook_collect
from file_system import save_posts_images, save_albums_photos
from face_api import get_persons
from flask import Flask, request, Response
from utils import get_all_image_paths
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

        # return str(data['albums_photos'])
        # return(str(get_all_image_paths(data)))

        all_image_paths = get_all_image_paths(data)

    # Detectez persoanele din imagini
        persons = get_persons(all_image_paths)

        persons = get_persons(
            ["/images/2965321766845954/441536455891177/image.jpg",
             "/images/2965321766845954/630738140304340/image.jpg",
             "/images/2965321766845954/527766443934844/image.jpg",
             "/images/2965321766845954/237111246333700/image.jpg",
             ])

        em = pickle.dumps(persons[0]['embedding'])

        database.insert_person(db_connection, em)

        return str(em)

    # TODO: salveaza metadatele in baza de date

    except:
        return Response.status_code(500)

    return str(data)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
