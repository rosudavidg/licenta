-- Adaugarea in baza de date a tipurilor de raspunsuri

-- Raspuns de tip text, format ascii
INSERT INTO answer_types (name) VALUES ('text');

-- Raspuns de tip notify, care nu contine date (ex: apasarea unui buton OK)
INSERT INTO answer_types (name) VALUES ('notify');
