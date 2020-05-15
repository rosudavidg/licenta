import facebook
# TODO: remove next line
from test_data import data as my_test_data

# Limita de rezultate pentru o cerere
LIMIT = 255


def extract_path(url):
    """Primeste un url de tip next paging si intoarce doar calea relativa"""
    pos = 0
    occurrences = 0
    occurrences_target = 4
    char_target = '/'

    while occurrences != occurrences_target:
        if url[pos] == char_target:
            occurrences += 1
        pos += 1

    return url[pos:]


def collect_user_profile(graph):
    """Colecteaza profilul utilizatorului"""

    # Cerere Facebook API
    res = graph.get_object(
        'me',
        fields='id,first_name,last_name,location,email,gender,birthday,favorite_athletes,favorite_teams,sports,hometown,languages',
        locale='en_GB'
    )

    # Adaugare set de date
    profile = res

    return profile


def collect_user_posts(graph):
    """Colecteaza postarile utilizatorului"""

    # Cerere Facebook API
    res = graph.get_object(
        'me/posts',
        fields='id,created_time,type,full_picture,message,reactions.summary(true)',
        limit=LIMIT,
        locale='en_GB'
    )

    # Adaugare set de date
    posts = res['data']

    while ('paging' in res) and ('next' in res['paging']):
        res = graph.get_object(extract_path(res['paging']['next']))
        posts += res['data']

    return posts


def collect_user_music(graph):
    """Colecteaza aprecierile muzicale ale utilizatorului"""
    done = False
    cursors_after = None
    music = []

    while not done:
        # Cerere Facebook API
        res = graph.get_object(
            'me/music',
            fields='genre,created_time,name',
            limit=LIMIT,
            after=cursors_after,
            locale='en_GB'
        )

        # Adaugare set de date
        music += res['data']

        # Verificare daca mai exista date
        if 'next' in res['paging']:
            cursors_after = res['paging']['cursors']['after']
        else:
            done = True

    # Filtrare date care nu au gen muzical
    music = list(filter(lambda e: 'genre' in e, music))

    return music


def collect_user_games(graph):
    """Colecteaza paginile apreciate de utilizator cu spcific de gaming"""
    done = False
    cursors_after = None
    games = []

    while not done:
        # Cerere Facebook API
        res = graph.get_object(
            'me/games',
            fields='name,id,created_time',
            limit=LIMIT,
            after=cursors_after,
            locale='en_GB'
        )

        # Adaugare set de date
        games += res['data']

        # Verificare daca mai exista date
        if 'next' in res['paging']:
            cursors_after = res['paging']['cursors']['after']
        else:
            done = True

    return games


def collect_user_accounts(graph):
    """Colecteaza conturile pe care utilizatorul le administreaza"""
    done = False
    cursors_after = None
    accounts = []

    while not done:
        # Cerere Facebook API
        res = graph.get_object(
            'me/accounts',
            fields='id,name,category',
            limit=LIMIT,
            after=cursors_after,
            locale='en_GB'
        )

        # Adaugare set de date
        accounts += res['data']

        # Verificare daca mai exista date
        if 'next' in res['paging']:
            cursors_after = res['paging']['cursors']['after']
        else:
            done = True

    return accounts


def collect_user_likes(graph):
    """Colecteaza paginile pe care utilizatorul le apreciaza"""
    done = False
    cursors_after = None
    likes = []

    while not done:
        # Cerere Facebook API
        res = graph.get_object(
            'me/likes',
            fields='id,name,created_time,about',
            limit=LIMIT,
            after=cursors_after,
            locale='en_GB'
        )

        # Adaugare set de date
        likes += res['data']

        # Verificare daca mai exista date
        if 'next' in res['paging']:
            cursors_after = res['paging']['cursors']['after']
        else:
            done = True

    return likes


def collect_user_groups(graph):
    """Colecteaza grupurile in care se afla utilizatorul"""
    done = False
    cursors_after = None
    groups = []

    while not done:
        # Cerere Facebook API
        res = graph.get_object(
            'me/groups',
            fields='id,name,created_time,description',
            limit=LIMIT,
            after=cursors_after,
            locale='en_GB'
        )

        # Adaugare set de date
        groups += res['data']

        # Verificare daca mai exista date
        if 'next' in res['paging']:
            cursors_after = res['paging']['cursors']['after']
        else:
            done = True

    return groups


def collect_user_movies(graph):
    """Colecteaza filmele apreciate de catre utilizator"""
    done = False
    cursors_after = None
    movies = []

    while not done:
        # Cerere Facebook API
        res = graph.get_object(
            'me/movies',
            fields='id,name,created_time,description',
            limit=LIMIT,
            after=cursors_after,
            locale='en_GB'
        )

        # Adaugare set de date
        movies += res['data']

        # Verificare daca mai exista date
        if 'next' in res['paging']:
            cursors_after = res['paging']['cursors']['after']
        else:
            done = True

    return movies


def collect_user_books(graph):
    """Colecteaza cartile apreciate de catre utilizator"""
    done = False
    cursors_after = None
    books = []

    while not done:
        # Cerere Facebook API
        res = graph.get_object(
            'me/books',
            fields='id,name,created_time',
            limit=LIMIT,
            after=cursors_after,
            locale='en_GB'
        )

        # Adaugare set de date
        books += res['data']

        # Verificare daca mai exista date
        if 'next' in res['paging']:
            cursors_after = res['paging']['cursors']['after']
        else:
            done = True

    return books


def collect_user_albums(graph):
    """Colecteaza albumele foto ale utilizatorului"""

    # Cerere Facebook API
    res = graph.get_object(
        'me/albums',
        fields='created_time,id,name,count,description,location,place,type,comments',
        limit=LIMIT,
        locale='en_GB'
    )

    # Adaugare set de date
    albums = res['data']

    while ('paging' in res) and ('next' in res['paging']):
        res = graph.get_object(extract_path(res['paging']['next']))
        albums += res['data']

    return albums


def collect_user_album_photos(graph, album_id):
    """Colecteaza imaginile dintr-un album al utilizatorului"""

    # Cerere Facebook API
    res = graph.get_object(
        f'{album_id}/photos',
        fields='images,id,created_time',
        limit=LIMIT,
        locale='en_GB'
    )

    # Adaugare set de date
    photos = res['data']

    while ('paging' in res) and ('next' in res['paging']):
        res = graph.get_object(extract_path(res['paging']['next']))
        photos += res['data']

    return photos


def collect_user_albums_photos(graph):
    """Colecteaza imaginile din albumele utilizatorului"""

    # Colecteaza albumele utilizatorului
    albums = collect_user_albums(graph)

    # Colecteaza toate pozele din fiecare album
    photos = [collect_user_album_photos(
        graph, album['id']) for album in albums]

    return photos


def facebook_collect(token):
    """
    Colecteaza datele utilizatorului si le intoarce.
    In caz de eroare, se arunca o exceptie generica.
    """
    # TODO: remove next line
    return my_test_data
    try:
        graph = facebook.GraphAPI(token)

        profile = collect_user_profile(graph)
        posts = collect_user_posts(graph)
        music = collect_user_music(graph)
        games = collect_user_games(graph)
        accounts = collect_user_accounts(graph)
        likes = collect_user_likes(graph)
        groups = collect_user_groups(graph)
        movies = collect_user_movies(graph)
        books = collect_user_books(graph)
        albums_photos = collect_user_albums_photos(graph)

        data = {
            'profile': profile,
            'games': games,
            'accounts': accounts,
            'posts': posts,
            'music': music,
            'likes': likes,
            'groups': groups,
            'movies': movies,
            'books': books,
            'albums_photos': albums_photos
        }

        return data
    except:
        raise Exception('Something Bad Happened.')
