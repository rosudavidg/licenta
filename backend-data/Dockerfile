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

# Expunerea portului pe care ruleaza serviciul
EXPOSE 5000

# Rularea serviciului
CMD ["python3", "/usr/src/app/server.py"]
