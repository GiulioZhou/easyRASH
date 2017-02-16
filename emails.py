from flask import Flask, request, jsonify, url_for, session, current_app, render_template, url_for, render_template, flash, redirect
from flask_mail import Message, Mail
from itsdangerous import URLSafeTimedSerializer
from easyRASH import app, mail
import datetime, os, json

def ret_url(filename,folder):
	return os.path.join(current_app.root_path, current_app.static_folder+folder, filename)
def get_static_json_file(filename):
	url = ret_url(filename, "/json")
	return json.load(open(url))

#Funzioni per generare un link di conferma
def generate_confirmation_token(email):
	serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
	return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])

def confirm_token(token, expiration=3600):
	serializer = URLSafeTimedSerializer(app.config['SECRET_KEY'])
	try:
		email = serializer.loads(
			token,
			salt=app.config['SECURITY_PASSWORD_SALT'],
			max_age=expiration
		)
	except:
		return False
	return email	
	
def send_email(to, subject, template):
	msg = Message(
		subject,
		recipients=[to],
		html=template,
		sender=app.config['MAIL_USERNAME']
	)
	mail.send(msg)

@app.route('/confirm/<token>')
def confirm_email(token):
	try:
		email = confirm_token(token)
	except:
		return 'The confirmation link is invalid or has expired.'
	data=get_static_json_file("users.json")
	for user in data.values():
		if user["email"]==email:
			if user["confirmed"]==True:
				return 'Account already confirmed. Please login.'
			else:
				user["confirmed"]=True
				with open(ret_url("users.json", "/json"), "w") as file:
					json.dump(data, file, indent=4)
				return 'You have confirmed your account. Thanks!'
			break
	return redirect("/")
	
