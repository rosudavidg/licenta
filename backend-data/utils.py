from math import sqrt, pow


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


def same_word(word1, word2):
    threshold = 0.92
    keys = {
        'q': {'x': 0, 'y': 0},
        'w': {'x': 1, 'y': 0},
        'e': {'x': 2, 'y': 0},
        'r': {'x': 3, 'y': 0},
        't': {'x': 4, 'y': 0},
        'y': {'x': 5, 'y': 0},
        'u': {'x': 6, 'y': 0},
        'i': {'x': 7, 'y': 0},
        'o': {'x': 8, 'y': 0},
        'p': {'x': 9, 'y': 0},
        'a': {'x': 0, 'y': 1},
        's': {'x': 1, 'y': 1},
        'd': {'x': 2, 'y': 1},
        'f': {'x': 3, 'y': 1},
        'g': {'x': 4, 'y': 1},
        'h': {'x': 5, 'y': 1},
        'j': {'x': 6, 'y': 1},
        'k': {'x': 7, 'y': 1},
        'l': {'x': 8, 'y': 1},
        'z': {'x': 0, 'y': 2},
        'x': {'x': 1, 'y': 2},
        'c': {'x': 2, 'y': 2},
        'v': {'x': 3, 'y': 2},
        'b': {'x': 4, 'y': 2},
        'n': {'x': 5, 'y': 2},
        'm': {'x': 6, 'y': 2},
    }

    word1 = word1.lower()
    word2 = word2.lower()

    if len(word1) != len(word2):
        return False

    p = 0

    for i in range(len(word1)):
        l1 = word1[i]
        l2 = word2[i]
        p += sqrt(pow(keys[l1]['x'] - keys[l2]['x'], 2) +
                  pow(keys[l1]['y'] - keys[l2]['y'], 2))

    acc = 1 - (p / (sqrt(84) * len(word1)))

    return acc > threshold
