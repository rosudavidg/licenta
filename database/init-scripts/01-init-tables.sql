-- Tabela pentru utilizatori
CREATE TABLE IF NOT EXISTS users (
    -- Id unic al unui utilizator
    id BIGINT PRIMARY KEY,
    -- Email
    email VARCHAR (50),
    -- Prenume
    first_name VARCHAR (64),
    -- Numele de familie
    last_name VARCHAR (64),
    -- Orasul actual
    location VARCHAR (64),
    -- Genul
    gender VARCHAR (16),
    -- Data de nastere
    birthday DATE,
    -- Orasul natal
    hometown VARCHAR (64),
    -- Detinerea de permis auto,
    driving_licence BOOLEAN,
    -- Datele utilizatorului au fost prelucrate
    ready BOOLEAN DEFAULT FALSE,
    -- Data la care s-a inregistrat pe platforma
    timestamp_created TIMESTAMP DEFAULT NOW()
);

-- Tabela pentru limbile cunoscute de catre utilizatori
CREATE TABLE IF NOT EXISTS languages (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Numele limbii
    name VARCHAR (64) NOT NULL
);

-- Tabela pentru genurile muzicale
CREATE TABLE IF NOT EXISTS music_genres (
    -- Id al genului muzical
    id SERIAL PRIMARY KEY,
    -- Numele limbii
    genre VARCHAR (64) NOT NULL,
    -- Lista de tag-uri care definesc acest gen (elemente separate prin virgula)
    tags VARCHAR (256) NOT NULL
);

-- Tabela pentru asocierile dintre utilizatori si muzica
CREATE TABLE IF NOT EXISTS users_music_genres (
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Id-ul genului muzical
    music_genre_id INTEGER REFERENCES music_genres(id),
    -- Numele
    name VARCHAR (128) NOT NULL,
    -- Data la care a fost apeciata intrarea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru imagini
CREATE TABLE IF NOT EXISTS images (
    -- Id al imaginii
    id BIGINT PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Calea absoluta la care se afla imaginea
    path VARCHAR (128) NOT NULL,
    -- Data la care a fost adaugata imaginea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru conturile administrate de catre utilizator
CREATE TABLE IF NOT EXISTS accounts (
    -- Id al contului
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Numele
    name VARCHAR (256) NOT NULL
);

-- Tabela pentru echipele apreciate de catre utilizator
CREATE TABLE IF NOT EXISTS favorite_teams (
    -- Id al echipei
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Numele
    name VARCHAR (256) NOT NULL
);

-- Tabela pentru atletii apreciati de catre utilizator
CREATE TABLE IF NOT EXISTS favorite_athletes (
    -- Id al atletului
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Numele
    name VARCHAR (256) NOT NULL
);

-- Tabela pentru grupurile din care utilizatorul face parte
CREATE TABLE IF NOT EXISTS groups (
    -- Id al grupului
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Numele
    name VARCHAR (256) NOT NULL,
    -- Data la care a fost adaugata intrarea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru jocurile apreciate de catre utilizator
CREATE TABLE IF NOT EXISTS games (
    -- Id al jocului
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Numele
    name VARCHAR (256) NOT NULL,
    -- Data la care a fost adaugata intrarea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru categoriile paginilor apreciate de catre utilizator
-- UNUSED
CREATE TABLE IF NOT EXISTS pages_categories (
    -- Id al categoriei
    id SERIAL PRIMARY KEY,
    -- Numele categoriei
    category VARCHAR (64) NOT NULL,
    -- Lista de tag-uri care definesc categoria (elemente separate prin virgula)
    tags VARCHAR (256) NOT NULL
);

-- Tabela pentru paginile apreciate de catre utilizator
-- UNUSED
CREATE TABLE IF NOT EXISTS pages (
    -- Id al paginii
    id INTEGER NOT NULL,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Id al categoriei paginii
    page_category_id INTEGER REFERENCES pages_categories(id),
    -- Data la care a fost adaugata intrarea
    created_time TIMESTAMP NOT NULL,
    -- Constrangere pentru cheia primara
    PRIMARY KEY (user_id, id, page_category_id)
);

-- Tabela pentru definirea tipurilor de actiuni (evenimente)
CREATE TABLE IF NOT EXISTS logs_types (
    -- Id al tipului
    id SERIAL PRIMARY KEY,
    -- Numele actiunii
    name VARCHAR (64) NOT NULL
);

-- Tabela pentru a tine evidenta log-urilor
CREATE TABLE IF NOT EXISTS logs (
    -- Id al userului care a initiat evenimentul
    user_id BIGINT REFERENCES users(id),
    -- Tipul log-ului
    log_type_id INTEGER REFERENCES logs_types(id),
    -- Data la care s-a inregistrat log-ul
    timestamp_created TIMESTAMP DEFAULT NOW()
);

-- Tabela ce abstractiveaza o poza regasita in imagini
CREATE TABLE IF NOT EXISTS persons (
    -- Id al persoanei
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului (poate fi NULL)
    user_id BIGINT REFERENCES users(id),
    -- Embedding pentru face recognition
    embedding BYTEA NOT NULL
);

-- Toate aparitiile unei persoane in poze
CREATE TABLE IF NOT EXISTS faces (
    -- Id al fetei
    id SERIAL PRIMARY KEY,
    -- Id al persoanei
    person_id INTEGER REFERENCES persons(id),
    -- Id-ul imaginii in care apare fata
    image_id BIGINT REFERENCES images(id),
    -- Cooronata x a bounding box-ului
    x INTEGER NOT NULL,
    -- Cooronata y a bounding box-ului
    y INTEGER NOT NULL,
    -- Latimea bounding box-ului
    width INTEGER NOT NULL,
    -- Inaltimea bounding box-ului
    height INTEGER NOT NULL
);

-- Tabela pentru cartile apreciate de catre utilizator
CREATE TABLE IF NOT EXISTS books (
    -- Id al cartii
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Numele
    name VARCHAR (256) NOT NULL,
    -- Data la care a fost adaugata intrarea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru filmele apreciate de catre utilizator
CREATE TABLE IF NOT EXISTS movies (
    -- Id al filmului
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Numele
    name VARCHAR (256) NOT NULL,
    -- Data la care a fost adaugata intrarea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru aprecierile utilizatorului
CREATE TABLE IF NOT EXISTS likes (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Numele
    name VARCHAR (256) NOT NULL,
    -- Data la care a fost adaugata intrarea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru cuvinte uzuale
CREATE TABLE IF NOT EXISTS common_words (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Cuvantul
    word VARCHAR (64) NOT NULL
);

-- Tabela pentru tipurile de postari
CREATE TABLE IF NOT EXISTS post_types (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Tipul
    name VARCHAR (64) NOT NULL
);

-- Tabela pentru postari
CREATE TABLE IF NOT EXISTS posts (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Tipul
    post_type INTEGER REFERENCES post_types(id),
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Textul postarii
    message TEXT,
    -- Data la care a fost adaugata intrarea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru zilele din saptamana
CREATE TABLE IF NOT EXISTS days_of_the_week (
    -- Id (dar si a cata zi este)
    id INTEGER PRIMARY KEY,
    -- Numele
    name VARCHAR (32) NOT NULL
);

-- Tabela pentru anotimpuri
CREATE TABLE IF NOT EXISTS seasons (
    -- Id (dar si indexul lui, incepand cu primavara)
    id INTEGER PRIMARY KEY,
    -- Numele
    name VARCHAR (32) NOT NULL
);

-- Tipurile de raspunsuri la intrebari
CREATE TABLE IF NOT EXISTS answer_types (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Numele
    name VARCHAR (64) NOT NULL
);

-- Tipurile de intrebari care pot fi generate
CREATE TABLE IF NOT EXISTS question_types (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Numele
    name VARCHAR (64) NOT NULL,
    -- Tipul raspunsului
    answer_type INTEGER REFERENCES answer_types(id)
);

-- Intrebarile generate
CREATE TABLE IF NOT EXISTS questions (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Tipul intrebarii
    type INTEGER REFERENCES question_types(id),
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Mesajul intrebarii
    message TEXT,
    -- Intrebarea a primit sau nu raspuns
    answered BOOLEAN DEFAULT FALSE,
    -- Data la care a fost adaugata intrarea
    created_time TIMESTAMP DEFAULT NOW()
);

-- Intrebarile de tip - recunoastere persoane
CREATE TABLE IF NOT EXISTS questions_face (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul fetei
    face_id INTEGER REFERENCES faces(id)
);

-- Intrebarile de tip - memorare cuvinte - prezentare cuvinte
CREATE TABLE IF NOT EXISTS questions_common_words_notify (
    -- Intrebarea
    id INTEGER UNIQUE REFERENCES questions(id),
    -- Numarul de raspunsuri care trebuie date
    answers_target INTEGER DEFAULT 3,
    -- Numarul de raspunsuri date
    answers INTEGER DEFAULT 0,
    -- Lista de cuvinte, separate prin virgula
    words VARCHAR (256) NOT NULL
);

-- Intrebarile de tip - scadere - prima scadere
CREATE TABLE IF NOT EXISTS questions_subtraction_notify (
    -- Intrebarea
    id INTEGER UNIQUE REFERENCES questions(id),
    -- Numarul de raspunsuri care trebuie date
    answers_target INTEGER DEFAULT 5,
    -- Numarul de raspunsuri date
    answers INTEGER DEFAULT 0,
    -- Numarul cu care trebuie sa scada
    number INTEGER NOT NULL
);

-- Intrebarile de tip - scadere - de a a doua scadere
CREATE TABLE IF NOT EXISTS questions_subtraction (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul primei intrebari
    notify_id INTEGER REFERENCES questions_subtraction_notify(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre scaderi
CREATE TABLE IF NOT EXISTS answers_subtraction (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul este sau nu corect
    correct BOOLEAN,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Intrebarile de tip - cuvant invers
CREATE TABLE IF NOT EXISTS questions_reversed_word (
    -- Intrebarea
    id INTEGER UNIQUE REFERENCES questions(id),
    -- Cuvantul care trebuie scris invers
    word VARCHAR (256) NOT NULL
);

-- Intrebarile de tip - memorare cuvinte - intrebare cuvinte
CREATE TABLE IF NOT EXISTS questions_common_words (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul intrebarii de prezentare a cuvintelor
    notify_id INTEGER REFERENCES questions_common_words_notify(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre persoane din imagini
CREATE TABLE IF NOT EXISTS answers_face (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre ziua saptamanii
CREATE TABLE IF NOT EXISTS answers_today (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    day TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre anotimp
CREATE TABLE IF NOT EXISTS answers_season (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    season TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile cuvinte uzuale
CREATE TABLE IF NOT EXISTS answers_common_words (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    text TEXT,
    -- Precizia raspunsului
    accuracy FLOAT,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS traffic_signs (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Calea catre imagine
    path VARCHAR (128) NOT NULL,
    -- Numele semnului
    name VARCHAR (128) NOT NULL
);

-- Pozele cu jocul de tip labirint
CREATE TABLE IF NOT EXISTS mazes (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Calea catre imagine
    path VARCHAR (128) NOT NULL,
    -- Raspunsul corect
    correct VARCHAR (1) NOT NULL
);

CREATE TABLE IF NOT EXISTS traffic_lights (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Calea catre imagine
    path VARCHAR (128) NOT NULL,
    -- Daca poti sau nu traversa
    value BOOLEAN NOT NULL
);

-- Intrebarile de tip - recunoastere indicator auto
CREATE TABLE IF NOT EXISTS questions_traffic_sign (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul indicatorului
    traffic_signs INTEGER REFERENCES traffic_signs(id)
);

-- Intrebarile de tip - maze
CREATE TABLE IF NOT EXISTS questions_maze (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul jocului
    maze_id INTEGER REFERENCES mazes(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre jocul maze
CREATE TABLE IF NOT EXISTS answers_maze (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Intrebarile de tip - semafor
CREATE TABLE IF NOT EXISTS questions_traffic_light (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul indicatorului
    traffic_light_id INTEGER REFERENCES traffic_lights(id)
);

-- Variantele de raspuns la intrebarile de tip - recunoastere indicator auto
CREATE TABLE IF NOT EXISTS questions_traffic_sign_choices (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul indicatorului
    traffic_signs INTEGER REFERENCES traffic_signs(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre indicatoare auto
CREATE TABLE IF NOT EXISTS answers_traffic_sign (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre semafoare
CREATE TABLE IF NOT EXISTS answers_traffic_light (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre ziua de nastere
CREATE TABLE IF NOT EXISTS answers_birthday (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    date DATE,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre data de astazi
CREATE TABLE IF NOT EXISTS answers_today_date (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    date DATE,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Rezultatele utilizatorului la jocul de memorie
CREATE TABLE IF NOT EXISTS answers_memory_game (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Scorul utilizatorului
    score INTEGER,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Tipurile de animale
CREATE TABLE IF NOT EXISTS animal_types (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Numele animalului
    name VARCHAR (64),
    -- Simonime sau cuvinte asemanatoare
    tags TEXT
);

-- Pozele cu animale
CREATE TABLE IF NOT EXISTS animals (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Id al tipului de animal
    animal_type BIGINT REFERENCES animal_types(id),
    -- Calea absoluta la care se afla imaginea
    path VARCHAR (128) NOT NULL
);

-- Intrebarile de tip - recunoastere animal
CREATE TABLE IF NOT EXISTS questions_animal (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul animalului
    animal_id INTEGER REFERENCES animals(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre animale
CREATE TABLE IF NOT EXISTS answers_animal (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Zarurile
CREATE TABLE IF NOT EXISTS dices (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Valoarea zarului
    value INTEGER,
    -- Calea absoluta la care se afla imaginea
    path VARCHAR (128) NOT NULL
);

-- Intrebarile de tip - recunoastere zaruri
CREATE TABLE IF NOT EXISTS questions_dices (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul primului zar
    first_dice_id INTEGER REFERENCES dices(id),
    -- Id-ul celui de-al doilea zar
    second_dice_id INTEGER REFERENCES dices(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre zaruri
CREATE TABLE IF NOT EXISTS answers_dices (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre ceas
CREATE TABLE IF NOT EXISTS answers_clock (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Calea absoluta la care se afla imaginea
    path VARCHAR (128) NOT NULL,
    -- Raspunsul este corect sau nu
    correct BOOLEAN,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre poligoane
CREATE TABLE IF NOT EXISTS answers_polygon (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Calea absoluta la care se afla imaginea
    path VARCHAR (128) NOT NULL,
    -- Raspunsul este corect sau nu
    correct BOOLEAN,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre orasul curent
CREATE TABLE IF NOT EXISTS answers_location (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre orasul natal
CREATE TABLE IF NOT EXISTS answers_hometown (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Intrebarile de tip limbi straine
CREATE TABLE IF NOT EXISTS questions_language (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul limbii
    language_id INTEGER REFERENCES languages(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre limbile straine
CREATE TABLE IF NOT EXISTS answers_languages (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul este afirmativ sau pozitiv
    value BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Intrebarile de tip genuri muzicale
CREATE TABLE IF NOT EXISTS questions_music_genre (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul genului muzical
    music_genre_id INTEGER REFERENCES music_genres(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre genuri muzicale
CREATE TABLE IF NOT EXISTS answers_music_genre (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul este afirmativ sau pozitiv
    value BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Intrebarile de tip postari
CREATE TABLE IF NOT EXISTS questions_post (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul tipului de postare
    post_type INTEGER REFERENCES post_types(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre postari
CREATE TABLE IF NOT EXISTS answers_post (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul este afirmativ sau pozitiv
    value BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Intrebarile de tip carte
CREATE TABLE IF NOT EXISTS questions_book (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul genului muzical
    book_id INTEGER REFERENCES books(id)
);

-- Intrebarile de tip film
CREATE TABLE IF NOT EXISTS questions_movie (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul genului muzical
    movie_id INTEGER REFERENCES movies(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre carti
CREATE TABLE IF NOT EXISTS answers_book (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul este afirmativ sau pozitiv
    value BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre filme
CREATE TABLE IF NOT EXISTS answers_movie (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul este afirmativ sau pozitiv
    value BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre zi sau noapte
CREATE TABLE IF NOT EXISTS answers_day_or_night (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Orase
CREATE TABLE IF NOT EXISTS cities (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Numele orasului
    name VARCHAR (128)
);

-- Intrebarile de tip directie
CREATE TABLE IF NOT EXISTS questions_directional (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul orasului stanga
    left_city_id INTEGER REFERENCES cities(id),
    -- Id-ul orasului dreapta
    right_city_id INTEGER REFERENCES cities(id),
    -- Id-ul orasului cerut
    correct_id INTEGER REFERENCES cities(id)
);

-- Intrebarile de tip rest cumparaturi
CREATE TABLE IF NOT EXISTS questions_change (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Suma totala
    total INTEGER NOT NULL,
    -- Valoarea cumparaturilor
    value INTEGER NOT NULL
);

-- Intrebarile de tip bnai (adunare)
CREATE TABLE IF NOT EXISTS questions_money (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Suma initiala
    initial INTEGER NOT NULL,
    -- Valoarea in plus
    increase INTEGER NOT NULL
);

-- Intrebarile de tip urmatoarea litera
CREATE TABLE IF NOT EXISTS questions_next_letter (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Litera
    letter VARCHAR (1)
);

-- Intrebarile de tip litera anterioara
CREATE TABLE IF NOT EXISTS questions_prev_letter (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Litera
    letter VARCHAR (1)
);


-- Raspunsurile utilizatorilor la intrebarile de tip urmatoarea litera
CREATE TABLE IF NOT EXISTS answers_next_letter (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile de tip litera anterioara
CREATE TABLE IF NOT EXISTS answers_prev_letter (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile rest cumparaturi
CREATE TABLE IF NOT EXISTS answers_change (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile bani (adunare)
CREATE TABLE IF NOT EXISTS answers_money (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor drespre copii
CREATE TABLE IF NOT EXISTS answers_children (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Valoarea raspunsului
    value BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor drespre frati
CREATE TABLE IF NOT EXISTS answers_brothers (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Valoarea raspunsului
    value BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor drespre surori
CREATE TABLE IF NOT EXISTS answers_sisters (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Valoarea raspunsului
    value BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor drespre animale de companie
CREATE TABLE IF NOT EXISTS answers_pets (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Valoarea raspunsului
    value BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor drespre copii (follow up - cati copii)
CREATE TABLE IF NOT EXISTS answers_children_follow_up (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Valoarea raspunsului
    count INTEGER,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor drespre frati (follow up - cati frati)
CREATE TABLE IF NOT EXISTS answers_brothers_follow_up (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Valoarea raspunsului
    count INTEGER,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor drespre surori (follow up - cate surori)
CREATE TABLE IF NOT EXISTS answers_sisters_follow_up (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Valoarea raspunsului
    count INTEGER,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor drespre animale (follow up - cate animale)
CREATE TABLE IF NOT EXISTS answers_pets_follow_up (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Valoarea raspunsului
    count INTEGER,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre directie
CREATE TABLE IF NOT EXISTS answers_directional (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre anul curent
CREATE TABLE IF NOT EXISTS answers_year (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    name TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Raspunsurile utilizatorilor la intrebarile despre cuvintele inverse
CREATE TABLE IF NOT EXISTS answers_reversed_word (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    word TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Culori
CREATE TABLE IF NOT EXISTS colors (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Numele culorii
    name TEXT NOT NULL,
    -- Codul HEX
    hex VARCHAR (7)
);

-- Intrebarile de tip culoare
CREATE TABLE IF NOT EXISTS questions_colors (
    -- Intrebarea
    id INTEGER REFERENCES questions(id),
    -- Id-ul culorii
    color_id INTEGER REFERENCES colors(id)
);

-- Raspunsurile utilizatorilor la intrebarile despre culori
CREATE TABLE IF NOT EXISTS answers_colors (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Intrebarea
    question_id INTEGER REFERENCES questions(id),
    -- Raspunsul utilizatorului
    answer TEXT,
    -- Raspunsul este corect sau nu
    correct BOOLEAN NOT NULL,
    -- Data la care a fost adaugat raspunsul
    created_time TIMESTAMP DEFAULT NOW()
);

-- Statisticile utilizatorului
CREATE TABLE IF NOT EXISTS stats (
    -- Id
    id SERIAL PRIMARY KEY,
    -- Preciziile au fost sau nu calculate inca
    ready BOOLEAN DEFAULT FALSE,
    -- Id al utilizatorului
    user_id BIGINT REFERENCES users(id),
    -- Data de inceput
    start_date DATE NOT NULL,
    -- Data de sfarsit
    end_date DATE NOT NULL,
    -- Acuratetea totala
    acc_total FLOAT,
    -- Acuratetea pentru memoria de scurta durata
    acc_short_term_memory FLOAT,
    -- Acuratetea pentru memoria de lunga durata
    acc_long_term_memory FLOAT,
    -- Acuratete - common words
    acc_common_words FLOAT,
    -- Acuratete - recunoastere persoane in imagini
    acc_face FLOAT,
    -- Acuratete - anotimp
    acc_season FLOAT,
    -- Acuratete - ziua din saptamana
    acc_today FLOAT,
    -- Acuratete - indicatoare rutiere
    acc_traffic_sign FLOAT,
    -- Acuratete - zi de nastere
    acc_birthday FLOAT,
    -- Acuratete - data de astazi
    acc_today_date FLOAT,
    -- Acuratete - recunoastere animale in imagini
    acc_animals FLOAT,
    -- Acuratete - joc de memorie
    acc_memory_game FLOAT,
    -- Acuratete - zaruri
    acc_dices FLOAT,
    -- Acuratete - desenare ceas
    acc_clock FLOAT,
    -- Acuratete - oras natal
    acc_hometown FLOAT,
    -- Acuratete - locatia curenta
    acc_location FLOAT,
    -- Acuratete - limbi
    acc_language FLOAT,
    -- Acuratete - genuri muzicale
    acc_music_genre FLOAT,
    -- Acuratete - postari
    acc_post FLOAT,
    -- Acuratete - carti
    acc_book FLOAT,
    -- Acuratete - filme
    acc_movie FLOAT,
    -- Acuratete - zi sau noapte
    acc_day_or_night FLOAT,
    -- Acuratete - semafor
    acc_traffic_light FLOAT,
    -- Acuratete - indicatoare directionale
    acc_directional FLOAT,
    -- Acuratete - anul curent
    acc_year FLOAT,
    -- Acuratete - cuvant invers
    acc_reversed_word FLOAT,
    -- Acuratete - rest
    acc_change FLOAT,
    -- Acuratete - litera urmatoare
    acc_next_letter FLOAT,
    -- Acuratete - lietera anterioara
    acc_prev_letter FLOAT,
    -- Acuratete - copii
    acc_children FLOAT,
    -- Acuratete - frati
    acc_brothers FLOAT,
    -- Acuratete - surori
    acc_sisters FLOAT,
    -- Acuratete - animale de companie
    acc_pets FLOAT,
    -- Acuratete - copii (cati)
    acc_children_follow_up FLOAT,
    -- Acuratete - frati (cati)
    acc_brothers_follow_up FLOAT,
    -- Acuratete - surori (cate)
    acc_sisters_follow_up FLOAT,
    -- Acuratete - animale de companie (cate)
    acc_pets_follow_up FLOAT,
    -- Acuratete - culori
    acc_colors FLOAT,
    -- Acuratete - scaderi succesive
    acc_subtraction FLOAT,
    -- Acuratete - adunare bani
    acc_money FLOAT,
    -- Acuratete - desene poligon
    acc_polygon FLOAT,
    -- Acuratete - joc labirint
    acc_maze FLOAT
);
