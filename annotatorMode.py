from flask import Flask, request, jsonify
from easyRASH import app
from users import ret_url, get_static_json_file, session

import json, os



@app.route('/api/annotMode', methods=['POST'])
def annotMode():

        data=get_static_json_file("mutex.json")
        
        key = request.args["url"]
        role = request.args["role"]
        status = False
        for url in data :
        	if url==key and data[key]=="0" and (role=="Reviewer " or role=="Chair "):
        		status=True
        		data[key]="1"
        		print (data)
        		with open(ret_url("mutex.json"), "w") as jfile:
        			jfile.write(json.dumps(data))
                	
        		
        return jsonify({'result': status})

@app.route('/api/esci', methods=['POST'])
def esci():
	data=get_static_json_file("mutex.json")
	key = request.args["url"]
	status=False
	for url in data :
		if url==key and data[key]=="1":
			
			data[key]="0"
			print (data)
			with open(ret_url("mutex.json"), "w") as jfile:
				jfile.write(json.dumps(data))
                	
        		

        return jsonify({'result': status})
