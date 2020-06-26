# Imaginea de baza alpine
FROM ubuntu:bionic

# Instalare python si cron
RUN apt-get update && apt-get install -y \
    python3.7 \
    python3-pip \
    cron

# Instalarea dependinte
COPY requirements.txt /usr/src/app/
RUN pip3 install --no-cache-dir -r /usr/src/app/requirements.txt

# Copiere aplicatie
COPY *.py /usr/src/app/
COPY crontab /etc/cron.d/email-service
COPY entrypoint.sh /usr/src/app/

# Schimba permisiuni pentru cron file
RUN chmod 0644 /etc/cron.d/email-service

# Aplica cron job
RUN crontab /etc/cron.d/email-service

# Fisier temporar log file
RUN touch /var/log/cron.log

# Setarea variabilelor de mediu
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]

# Comanda de rulare container
CMD cron && tail -f /var/log/cron.log
