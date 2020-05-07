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
    -- Locatia actuala
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
