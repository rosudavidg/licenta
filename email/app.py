import smtplib
import os
from get_docker_secret import get_docker_secret
import psycopg2


def create_database_connection():
    connection = psycopg2.connect(user=get_docker_secret(os.environ['DATABASE_USER']),
                                  password=get_docker_secret(
                                      os.environ['DATABASE_PASSWORD']),
                                  host="database",
                                  port="5432",
                                  database=get_docker_secret(os.environ['DATABASE_NAME']))

    return connection


def close_connection(connection):
    connection.close()


def get_valid_users():
    # Conexiune noua
    db_connection = create_database_connection()
    cursor = db_connection.cursor()

    sql = ("SELECT id FROM users WHERE timestamp_created + INTERVAL '7 DAY' <= NOW() AND email IS NOT NULL")

    try:
        cursor.execute(sql)
        return cursor.fetchall()
    except:
        db_connection.rollback()
        return []

    cursor.close()

    # Incheie conexiunea
    close_connection(db_connection)


def get_email_lists(users):
    # Conexiune noua
    db_connection = create_database_connection()
    cursor = db_connection.cursor()

    sql = ("SELECT count(*) FROM questions WHERE user_id = %s and created_time + INTERVAL '7 DAY' > NOW()")

    ids = []

    for user in users:
        user_id = user[0]

        try:
            cursor.execute(sql, (user_id,))

            data = cursor.fetchone()

            if data[0] == 0:
                ids.append(user_id)

        except:
            db_connection.rollback()
    cursor.close()

    cursor = db_connection.cursor()

    emails = []

    sql = ("SELECT email FROM users WHERE id = %s")

    for user_id in ids:
        try:
            cursor.execute(sql, (user_id,))

            email = cursor.fetchone()[0]

            emails.append(email)

        except:
            db_connection.rollback()

    cursor.close()

    # Incheie conexiunea
    close_connection(db_connection)

    return emails


def send_contact_response(to_email):
    gmail_user = get_docker_secret(os.environ['EMAIL_ADDRESS'])
    sent_from = 'Avatario Romania'
    gmail_password = get_docker_secret(os.environ['EMAIL_PASSWORD'])

    to = [to_email]
    subject = 'Memento'
    body = """\
    Salut!\n
    Nu ai raspuns la nicio intrebare in ultimele 7 zile.
    Intra acum pentru a-ti antrena mintea!\n
    Avatario
    """

    email_text = '\r\n'.join(['To: %s' % ','.join(to),
                              'From: %s' % sent_from,
                              'Subject: %s' % subject,
                              '', body])

    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.ehlo()
        server.login(gmail_user, gmail_password)
        server.sendmail(sent_from, to, email_text)
        server.close()

        return True
    except:
        return False


emails = get_email_lists(get_valid_users())

for email in emails:
    send_contact_response(email)
