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
