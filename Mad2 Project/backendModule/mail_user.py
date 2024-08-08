from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = "localhost" 
SMTP_PORT = 1025
SENDER_EMAIL = "admin@grocerystore.com" 
SENDER_PASSWORD = ''

def trigger_reminder_email(to, subject, content_body):
    reminder_Msg = MIMEMultipart()
    reminder_Msg["To"] = to
    reminder_Msg["Subject"] = subject
    reminder_Msg["From"] = SENDER_EMAIL
    reminder_Msg.attach(MIMEText(content_body, 'html'))
    client = SMTP(host = SMTP_HOST , port = SMTP_PORT)
    client.send_message(msg=reminder_Msg)
    client.quit()
