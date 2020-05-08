-- Tabela pentru utilizatori
CREATE TABLE IF NOT EXISTS users (
    -- Id unic al unui utilizator
    id INTEGER PRIMARY KEY,
    -- Email
    email VARCHAR (50) NOT NULL,
    -- Prenume
    first_name VARCHAR (64) NOT NULL,
    -- Numele de familie
    last_name VARCHAR (64) NOT NULL,
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
    -- Id unic al limbii
    id INTEGER PRIMARY KEY,
    -- Numele limbii
    name VARCHAR (64) NOT NULL
);

-- Tabela pentru asocierile dintre utilizatori si limbi
CREATE TABLE IF NOT EXISTS users_languages (
    -- Id al utilizatorului
    user_id INTEGER REFERENCES users(id),
    -- Id al limbii
    language_id INTEGER REFERENCES languages(id),
    -- Constrangere pentru cheia primara
    PRIMARY KEY (user_id, language_id)
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
    user_id INTEGER REFERENCES users(id),
    -- Id-ul genului muzical
    music_genre_id INTEGER REFERENCES music_genres(id),
    -- Data la care a fost apeciata intrarea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru imagini
CREATE TABLE IF NOT EXISTS images (
    -- Id al imaginii
    id INTEGER PRIMARY KEY,
    -- Id al utilizatorului
    user_id INTEGER REFERENCES users(id),
    -- Calea absoluta la care se afla imaginea
    path VARCHAR (128) NOT NULL,
    -- Data la care a fost adaugata imaginea
    created_time TIMESTAMP NOT NULL
);

-- Tabela pentru tipurile de cont pe care utilizatorul le administreaza
CREATE TABLE IF NOT EXISTS accounts_categories (
    -- Id al tipului contului
    id SERIAL PRIMARY KEY,
    -- Numele categoriei
    category VARCHAR (64) NOT NULL,
    -- Lista de tag-uri care definesc categoria (elemente separate prin virgula)
    tags VARCHAR (256) NOT NULL
);

-- Tabela pentru conturile administrate de catre utilizator
CREATE TABLE IF NOT EXISTS accounts (
    -- Id al contului
    id INTEGER NOT NULL,
    -- Id al utilizatorului
    user_id INTEGER REFERENCES users(id),
    -- Id-ul genului muzical
    account_category_id INTEGER REFERENCES accounts_categories(id),
    -- Constrangere pentru cheia primara
    PRIMARY KEY (user_id, id)
);

-- Tabela pentru echipele apreciate de catre utilizator
CREATE TABLE IF NOT EXISTS favorite_teams (
    -- Id al echipei
    id INTEGER NOT NULL,
    -- Id al utilizatorului
    user_id INTEGER REFERENCES users(id),
    -- Constrangere pentru cheia primara
    PRIMARY KEY (user_id, id)
);

-- Tabela pentru atletii apreciati de catre utilizator
CREATE TABLE IF NOT EXISTS favorite_athletes (
    -- Id al atletului
    id INTEGER NOT NULL,
    -- Id al utilizatorului
    user_id INTEGER REFERENCES users(id),
    -- Constrangere pentru cheia primara
    PRIMARY KEY (user_id, id)
);

-- Tabela pentru grupurile din care utilizatorul face parte
CREATE TABLE IF NOT EXISTS groups (
    -- Id al grupului
    id INTEGER NOT NULL,
    -- Id al utilizatorului
    user_id INTEGER REFERENCES users(id),
    -- Data la care a fost adaugata intrarea
    created_time TIMESTAMP NOT NULL,
    -- Constrangere pentru cheia primara
    PRIMARY KEY (user_id, id)
);
