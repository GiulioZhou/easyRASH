from flask import Flask, request, jsonify, url_for, session, current_app
from easyRASH import app
from users import ret_url, get_static_json_file
import json, os

@app.route('/api/ciao', methods=['GET'])
def ciao():
	data=request.args
	return jsonify(data)




@app.route('/api/usr_docs', methods=['GET'])
def events():
	json_data = request.json
	data = get_static_json_file("events.json")
	print (json_data)

	
	
	
	
	
	
	return "ciao"
