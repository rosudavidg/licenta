from facebook_collector import facebook_collect
from file_system import save_images
from flask import Flask, request, Response

app = Flask(__name__)


@app.route('/users', methods=['POST'])
def index():
    """Adaugarea unui nou utilizator in sistem"""

    try:
        # Extrag access-token-ul din cerere
        token = request.args.get('token')

        # Colectez datele din profilul utilizatorului
        data = facebook_collect(token)

        # Salveaza imaginile asociate postarilor
        # save_images(data)

        # TODO: salveaza metadatele in baza de date

    except:
        return Response.status_code(500)

    return str(data)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
