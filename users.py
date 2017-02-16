from flask import Flask, request, jsonify, url_for, session, current_app, render_template, url_for
from emails import generate_confirmation_token, confirm_token, send_email
from easyRASH import app
import json, os, logging

#returns the path to a file
def ret_url(filename,folder):
	return os.path.join(current_app.root_path, current_app.static_folder+folder, filename)
#Function that returns the content of a jsonfile
#https://www.reddit.com/r/flask/comments/2i102e/af_how_to_open_static_file_specifically_json/
def get_static_json_file(filename):
	url = ret_url(filename, "/json")
	return json.load(open(url))

def error(msg):
	return json.dumps({
					'success': False,
					'message': msg
				})

def success(msg):
	return json.dumps({
					'success': True,
					'message': msg
				})

def input(field):
	if field in request.json:
		return request.json[field]
	else:
		return None

def removeadd(list, elem, newkey):
	list.remove(elem)
	list.append(newkey)

def updateevents(key, newkey):
	data = get_static_json_file("events.json")
	for event in data:
		for user in event["chairs"]:
			if key == user:
				removeadd(event["chairs"], user, newkey)

		for doc in event["submissions"]:
			for user in doc["reviewers"]:
				if key == user:
					removeadd(doc["reviewers"], user, newkey)
			for user in doc["authors"]:
				if key == user:
					removeadd(doc["authors"], user, newkey)

	with open(ret_url("events.json", "/json"), "w") as file:
				json.dump(data, file, indent=4)


@app.route('/api/register', methods=['POST'])
def register():
		json_data = request.json
		data=get_static_json_file("users.json")
		key=json_data["given_name"]+" "+json_data["family_name"]+" <"+json_data["email"]+">"
		if key in data:
			status = 'this user is already registered'
		else:
			data[key] = json_data
			data[key]["confirmed"]=False
			with open(ret_url("users.json", "/json"), "w") as file:
				json.dump(data, file, indent=4)
			status = True            
			token = generate_confirmation_token(json_data["email"])
			confirm_url = url_for('confirm_email', token=token, _external=True)
			html = render_template('authentication/registration_email.html', confirm_url=confirm_url)
			subject = "Please confirm your email"
			send_email(json_data["email"], subject, html)	
		return jsonify({'result': status})

@app.route('/api/editdata', methods=['POST'])
def editdata():
		data = get_static_json_file("users.json")
		key = session["name"]+" "+session["surname"]+" <"+session["email"]+">"
		usr = data[key]

		if input('family_name'):
			usr['family_name'] = input('family_name')

		if input('given_name'):
			usr['given_name'] = input('given_name')

		if input('pass'):
			if input('changepass') == usr['pass']:
				usr['pass'] = input('pass')
			else:
				return error('Password attuale errata')
		if input('email'):
			for user in data:
				if input('email') == data[user]['email']:
					return error('Email presente')
			usr['email'] = input('email')

		del data[key]

		newkey = usr["given_name"]+" "+usr["family_name"]+" <"+usr["email"]+">"
		data[newkey] = usr

		updateevents(key, newkey)

		session["email"] = usr["email"]
		session["name"] = usr["given_name"]
		session["surname"] = usr["family_name"]

		with open(ret_url("users.json", "/json"), "w") as file:
			json.dump(data, file , indent=4)
		return success('Edit done!')


@app.route('/api/login',methods=['POST'])
def login():
	json_data = request.json
	data=get_static_json_file("users.json")
	status = "Invalid username and/or password"
	for user in data.values():
		if user["email"]==json_data["email"] and user["pass"]==json_data["pass"]:
			if user["confirmed"]==False:
				status = "User not confirmed, verify your email first!"
				break
			session["email"] = user["email"]
			session["name"] = user["given_name"]
			session["surname"] = user["family_name"]
			session['logged_in'] = True
			status = True
			break
	return jsonify({'result': status, "user": {"name":session["name"], "surname":session["surname"]}, "email":session["email"]})


@app.route('/api/logout')
def logout():
	session.clear()
	return jsonify({'result': 'success'})


@app.route('/api/status')
def status():
	if session.get('logged_in'):
		if session['logged_in']:
			return jsonify({'status': True})
	else:
		return jsonify({'status': False})


@app.route('/api/getUser', methods=['GET'])
def getUser():
	result = {}
	for item in session:
		result[item] = session[item]
	return jsonify(result)
