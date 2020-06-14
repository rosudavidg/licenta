-- Adaugarea in baza de date a tipurilor de intrebari

-- Intrebare pentru reproducerea ultimelor cuvinte prezentate
INSERT INTO question_types (name, answer_type)
    SELECT 'common_words', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare pentru prezentarea unor cuvinte noi
INSERT INTO question_types (name, answer_type)
    SELECT 'common_words_notify', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'confirm';

-- Intrebare pentru recunoasterea unei persoane intr-o fotografie
INSERT INTO question_types (name, answer_type)
    SELECT 'face', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare pentru recunoasterea unui anotimp
INSERT INTO question_types (name, answer_type)
    SELECT 'season', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare pentru recunoasterea zilei din saptamana
INSERT INTO question_types (name, answer_type)
    SELECT 'today', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare despre detinerea de permis auto
INSERT INTO question_types (name, answer_type)
    SELECT 'driving_licence', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare despre semne de circulatie
INSERT INTO question_types (name, answer_type)
    SELECT 'traffic_sign', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare tip zi de nastere
INSERT INTO question_types (name, answer_type)
    SELECT 'birthday', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'date';

-- Intrebare recunoastere data de astazi
INSERT INTO question_types (name, answer_type)
    SELECT 'today_date', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'date';

-- Wrapper pentru jocul de memorie
INSERT INTO question_types (name, answer_type)
    SELECT 'memory_game', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'score';

-- Intrebare recunoastere animal
INSERT INTO question_types (name, answer_type)
    SELECT 'animal', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare recunoastere zaruri
INSERT INTO question_types (name, answer_type)
    SELECT 'dices', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare ceas
INSERT INTO question_types (name, answer_type)
    SELECT 'clock', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'image';

-- Intrebare te tip oras natal
INSERT INTO question_types (name, answer_type)
    SELECT 'hometown', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare te tip oras curent
INSERT INTO question_types (name, answer_type)
    SELECT 'location', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare despre limbile straine cunoscute
INSERT INTO question_types (name, answer_type)
    SELECT 'language', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare despre genurile muzicale
INSERT INTO question_types (name, answer_type)
    SELECT 'music_genre', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare urmatoare pentru raspuns la genurile muzicale
INSERT INTO question_types (name, answer_type)
    SELECT 'music_genre_follow_up', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'confirm';

-- Intrebare despre postari
INSERT INTO question_types (name, answer_type)
    SELECT 'post', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare urmatoare pentru raspuns la postari
INSERT INTO question_types (name, answer_type)
    SELECT 'post_follow_up', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'confirm';

-- Intrebare despre carti
INSERT INTO question_types (name, answer_type)
    SELECT 'book', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare despre filme
INSERT INTO question_types (name, answer_type)
    SELECT 'movie', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare zi sau noapte
INSERT INTO question_types (name, answer_type)
    SELECT 'day_or_night', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare semafor
INSERT INTO question_types (name, answer_type)
    SELECT 'traffic_light', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare directie
INSERT INTO question_types (name, answer_type)
    SELECT 'directional', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare anul curent
INSERT INTO question_types (name, answer_type)
    SELECT 'year', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare cuvant invers
INSERT INTO question_types (name, answer_type)
    SELECT 'reversed_word', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare rest magazin (cumparaturi magazin)
INSERT INTO question_types (name, answer_type)
    SELECT 'change', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare bani (adaugare)
INSERT INTO question_types (name, answer_type)
    SELECT 'money', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare litera urmatoare in alfabet
INSERT INTO question_types (name, answer_type)
    SELECT 'next_letter', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare litera anterioara in alfabet
INSERT INTO question_types (name, answer_type)
    SELECT 'prev_letter', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare daca are copii
INSERT INTO question_types (name, answer_type)
    SELECT 'children', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare daca are frati
INSERT INTO question_types (name, answer_type)
    SELECT 'brothers', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare daca are surori
INSERT INTO question_types (name, answer_type)
    SELECT 'sisters', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare daca are copii (cati copii)
INSERT INTO question_types (name, answer_type)
    SELECT 'children_follow_up', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare daca are frati (cati frati)
INSERT INTO question_types (name, answer_type)
    SELECT 'brothers_follow_up', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare daca are surori (cate surori)
INSERT INTO question_types (name, answer_type)
    SELECT 'sisters_follow_up', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare despre animale de companie
INSERT INTO question_types (name, answer_type)
    SELECT 'pets', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'choice';

-- Intrebare despre animale de companie (cate animale)
INSERT INTO question_types (name, answer_type)
    SELECT 'pets_follow_up', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare despre culori
INSERT INTO question_types (name, answer_type)
    SELECT 'colors', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare pentru scadere (prima)
INSERT INTO question_types (name, answer_type)
    SELECT 'subtraction_notify', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';

-- Intrebare pentru scadere (de la a doua)
INSERT INTO question_types (name, answer_type)
    SELECT 'subtraction', answer_types.id
    FROM answer_types
    WHERE answer_types.name = 'text';
