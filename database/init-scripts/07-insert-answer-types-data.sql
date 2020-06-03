-- Adaugarea in baza de date a tipurilor de raspunsuri

-- Raspuns de tip text, format ascii
INSERT INTO answer_types (name) VALUES ('text');

-- Raspuns de tip confirm, care nu contine date (ex: apasarea unui buton OK)
INSERT INTO answer_types (name) VALUES ('confirm');

-- Raspuns de tip alegere
INSERT INTO answer_types (name) VALUES ('choice');

-- Raspuns de tip data
INSERT INTO answer_types (name) VALUES ('date');

-- Raspuns de tip score
INSERT INTO answer_types (name) VALUES ('score');
