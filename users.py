from flask import Flask, request, jsonify, url_for, session, current_app
from easyRASH import app
import json, os

#returns the path to a file
def ret_url(filename):
    return os.path.join(current_app.root_path, current_app.static_folder, filename)
#Function that returns the content of a jsonfile
#https://www.reddit.com/r/flask/comments/2i102e/af_how_to_open_static_file_specifically_json/
def get_static_json_file(filename):
    url = ret_url(filename)
    return json.load(open(url))

#https://realpython.com/blog/python/handling-user-authentication-with-angular-and-flask/

@app.route('/api/register', methods=['POST'])
def register():
        json_data = request.json
        data=get_static_json_file("users.json")
        key=json_data["given_name"]+" "+json_data["family_name"]+" <"+json_data["email"]+">"
        if key in data:
            status = 'this user is already registered'
        else:
            data[key] = json_data
            with open(ret_url("users.json"), "w") as file:
                json.dump(data, file)
            status = 'success'
        return jsonify({'result': status})

@app.route('/api/login',methods=['POST'])
def login():
    json_data = request.json

	#NON FUNZIONA LA OPEN!
    data=get_static_json_file("users.json")
    status = False
    for user in data.values():
		#il problema era che dovevo mettere .values()
		#user["email"] NON FUNZIONA
        if user["email"]==json_data["email"] and user["pass"]==json_data["pass"]:
			#session NON FUNZIONA
			#bisogna importare session da flask, se non funziona bisogna mettere la configurazione della chiave nel main
			#ok ho messo la chiave in init

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
    return jsonify(session)


