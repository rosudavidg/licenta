def get_all_image_paths(data):

    # Caile catre imagini
    paths = []

    # Extrage id-ul utilizatorului
    user_id = data['profile']['id']

    # Extrage imaginile din albumele utilizatorului
    albums_photos = data['albums_photos']

    # Compun base path
    base_path = f'/images/{user_id}'

    # Pentru fiecare album
    for album_photos in albums_photos:
        # Pentru fiecare poza din album
        for photo in album_photos:
            photo_id = photo['id']

            paths.append(f'{base_path}/{photo_id}/image.jpg')

    # Extrage postarile utilizatorului
    posts = data['posts']

    # Pentru fiecare postare
    for post in posts:
        # Verific daca are poza atasata
        if 'full_picture' in post:
            # Extrag id-ul postarii
            post_id = post['id'].split('_')[1]

            paths.append(f'{base_path}/{post_id}/image.jpg')

    return paths


def get_all_images(data):

    # Caile catre imagini
    images = []

    # Extrage id-ul utilizatorului
    user_id = data['profile']['id']

    # Extrage imaginile din albumele utilizatorului
    albums_photos = data['albums_photos']

    # Compun base path
    base_path = f'/images/{user_id}'

    # Pentru fiecare album
    for album_photos in albums_photos:
        # Pentru fiecare poza din album
        for photo in album_photos:
            photo_id = photo['id']
            created_time = photo['created_time']

            images.append((f'{base_path}/{photo_id}/image.jpg', created_time))

    # Extrage postarile utilizatorului
    posts = data['posts']

    # Pentru fiecare postare
    for post in posts:
        # Verific daca are poza atasata
        if 'full_picture' in post:
            # Extrag id-ul postarii
            post_id = post['id'].split('_')[1]
            created_time = post['created_time']

            images.append((f'{base_path}/{post_id}/image.jpg', created_time))

    return images
