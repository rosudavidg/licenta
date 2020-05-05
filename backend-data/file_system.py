import os
from requests import get


def get_best_image(photo):
    """
    Primeste o imagine dintr-un album si intoarce cea mai buna poza in ceea
    ce priveste dimensiunile acesteia
    """

    url = None  # URL catre cea mai buna imagine
    height = 0  # Inaltimea cea mai buna
    width = 0   # Latimea cea mai buna

    # Extrag lista cu posibilele imagini
    images = photo['images']

    # Verific fiecare imagine
    for image in images:
        # Extrag detaliile imaginii curente
        image_height = image['height']
        image_width = image['width']
        image_url = image['source']

        # Verific daca este mai buna decat imaginea selectata
        if (image_height > height) and (image_width > width):
            url = image_url
            height = image_height
            width = image_width

    # Intorc URL-ul catre cea mai buna imagine
    return url


def download_image(url, path, file_name):
    """
    Primeste un url si descarca imaginea la calea specificata
    """

    resp = get(url)

    with open(path + '/' + file_name, 'wb') as file:
        file.write(resp.content)


def save_posts_images(data):
    """
    Functie utilizata pentru a salva imaginile asociate postarilor unui
    utilizator nou
    """

    # Extrage id-ul utilizatorului
    user_id = data['profile']['id']

    # Extrage postarile utilizatorului
    posts = data['posts']

    # Creeare director pentru noul utilizator
    user_path = '/images/' + user_id
    os.mkdir(user_path)

    # Pentru fiecare postare, creeaza un nou director cu numele acesteia
    for post in posts:

        # Verific daca are poza atasata
        if 'full_picture' in post:
            # Extrag id-ul postarii
            post_id = post['id'].split('_')[1]

            # Creez un nou director pentru postare
            post_path = user_path + '/' + post_id
            os.mkdir(post_path)

            # Extrag URL-ul imaginii
            image_url = post['full_picture']

            # Descarca si salveaza imaginea local
            download_image(image_url, post_path, 'image.jpg')


def save_albums_photos(data):
    """
    Functie utilizata pentru a salva imaginile din albumele unui
    utilizator nou
    """

    # Extrage id-ul utilizatorului
    user_id = data['profile']['id']

    # Extrage imaginile din albumele utilizatorului
    albums_photos = data['albums_photos']

    # Calea catre datele utilizatorului
    user_path = '/images/' + user_id

    # Pentru fiecare album
    for album_photos in albums_photos:

        # Pentru fiecare poza din album
        for photo in album_photos:

            photo_id = photo['id']

            # Extrag cea mai buna imagine
            image_url = get_best_image(photo)

            # Creez un nou director pentru imagine
            image_path = user_path + '/' + photo_id
            os.mkdir(image_path)

            # Descarca si salveaza imaginea local
            download_image(image_url, image_path, 'image.jpg')
