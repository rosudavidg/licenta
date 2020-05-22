from nltk.corpus import stopwords
from gensim.models.doc2vec import Doc2Vec
import nltk
import pickle

stop_words = set(stopwords.words('english'))
tags_index = {'travelling': 1, 'sports': 2, 'technology': 3}

# Incarca modelul doc2vec
model = Doc2Vec.load('/usr/src/app/post_model.d2v')

# Incarca modelul Logistic Regression
logreg = pickle.load(open('/usr/src/app/post_model.lreg', 'rb'))


def tokenize_text(text):
    """Tokenizeaza textul"""

    tokens = []

    for sent in nltk.sent_tokenize(text):
        for word in nltk.word_tokenize(sent):

            # Ignora stop_words
            if word.lower() in stop_words:
                continue

            # Adauga cuvantul in lista
            tokens.append(word.lower())

    # Intoarce lista de tokeni
    return tokens


def predict(text):
    # Tokenizeaza textul
    words = tokenize_text(text)

    # Calculeaza vectorul
    vector = model.infer_vector(words, steps=20)

    # Prezice tag-ul
    tag = logreg.predict([vector])[0]

    # Intoarce tagul
    for k, v in tags_index.items():
        if v == tag:
            return k
