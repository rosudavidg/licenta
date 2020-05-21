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
    -- Precizia raspunsului
    accuracy FLOAT,
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
    -- Precizia raspunsului
    accuracy FLOAT,
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
