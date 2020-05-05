# Imaginea de baza alpine
FROM alpine:edge

# Actualizare pip
RUN apk add --update py-pip

# Copiere fisier dependinte
COPY requirements.txt /usr/src/app/

# Instalare dependinte
RUN pip install --no-cache-dir -r /usr/src/app/requirements.txt

# Copiere aplicatie
COPY server.py /usr/src/app/
COPY facebook_collector.py /usr/src/app/
COPY file_system.py /usr/src/app/

# Adaugare cale pentru salvare imagini
RUN mkdir images /

# Expunerea portului pe care ruleaza serviciul
EXPOSE 5000

# Rularea serviciului
CMD ["python3", "/usr/src/app/server.py"]
