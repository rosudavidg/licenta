# Imaginea de baza alpine
FROM ubuntu:bionic

# Instalare utilitare
RUN apt-get update && apt-get install -y \
    git \
    python3.7 \
    python3-pip \
    libsm6 libxext6 libxrender-dev

# Instalare opencv
RUN pip3 install opencv-python

# # Instalare Keras VGGFace
RUN pip3 install git+https://github.com/rcmalli/keras-vggface.git

# Instalare tensorflow
RUN pip3 install tensorflow

# Copiere fisier dependinte
COPY requirements.txt /usr/src/app/

# Instalare dependinte
RUN pip3 install --no-cache-dir -r /usr/src/app/requirements.txt

# Instalare stopwords si punkt din nltk
RUN python3 -m nltk.downloader stopwords
RUN python3 -m nltk.downloader punkt

# Copiere aplicatie
COPY *.py /usr/src/app/

# Copiere modele
COPY *_model.* /usr/src/app/

# Adaugare cale pentru salvare imagini
RUN mkdir /images

# Expunerea portului pe care ruleaza serviciul
EXPOSE 5000

# Rularea serviciului
CMD ["python3", "-W", "ignore", "/usr/src/app/server.py"]
