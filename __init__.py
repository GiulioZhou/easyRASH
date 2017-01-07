from flask import Flask, render_template, session
from flask_mail import Message, Mail
import json

app = Flask(__name__)

app.config.update(
	DEBUG=True,
	#SETTINGS
	SESSION_TYPE='memcached',
	SECRET_KEY='super secretkey',
	SECURITY_PASSWORD_SALT='I prefer sour',
	#EMAIL SETTINGS
	MAIL_SERVER='smtp.gmail.com',
	MAIL_PORT=465,
	MAIL_USE_SSL=True,
	MAIL_USERNAME='gaosunibo@gmail.com',
	MAIL_PASSWORD='G40sUn1b0'
	)
mail = Mail(app)

from easyRASH import views, users, events, annotatorMode, emails
