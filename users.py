from flask import Flask, request, jsonify, url_for, session, current_app, render_template, url_for
from emails import generate_confirmation_token, confirm_token, send_email
from easyRASH import app
import json, os

#returns the path to a file
def ret_url(filename,folder):
    return os.path.join(current_app.root_path, current_app.static_folder+folder, filename)
#Function that returns the content of a jsonfile
#https://www.reddit.com/r/flask/comments/2i102e/af_how_to_open_static_file_specifically_json/
def get_static_json_file(filename):
    url = ret_url(filename, "/json")
    return json.load(open(url))


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
                json.dump(data, file)
            status = True            
            token = generate_confirmation_token(json_data["email"])
            confirm_url = url_for('confirm_email', token=token, _external=True)
            html = render_template('registration_email.html', confirm_url=confirm_url)
            subject = "Please confirm your email"
            send_email(json_data["email"], subject, html)
            
            
        return jsonify({'result': status})

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
	return jsonify({'result': status})


@app.route('/api/logout')
def logout():
	session.pop('logged_in', None)
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


