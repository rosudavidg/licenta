-- Adaugarea in baza de date a tipurilor de intrebari

-- Intrebare pentru reproducerea ultimelor cuvinte prezentate
INSERT INTO question_types (name) VALUES ('common_words');

-- Intrebare pentru prezentarea unor cuvinte noi
INSERT INTO question_types (name) VALUES ('common_words_notify');

-- Intrebare pentru recunoasterea unei persoane intr-o fotografie
INSERT INTO question_types (name) VALUES ('face');

-- Intrebare pentru recunoasterea unui anotimp
INSERT INTO question_types (name) VALUES ('season');

-- Intrebare pentru recunoasterea zilei din saptamana
INSERT INTO question_types (name) VALUES ('today');
