import os
from requests import get


def download_image(url, path, file_name):
    """
    Primeste un url si descarca imaginea la calea specificata
    """
    resp = get(url)

    with open(path + '/' + file_name, 'wb') as file:
        file.write(resp.content)


def save_images(data):
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

    # TODO: save photos from albums
