from flask import Flask, request, jsonify
from easyRASH import app
from users import ret_url, get_static_json_file, session
import json, os


@app.route('/api/getDocs', methods=['GET'])
def events():
    data = get_static_json_file("events.json")
    #key=request.args["name"] + " " + request.args["surname"] + " <" + request.args["email"] +">"
    key=session["name"] + " " + session["surname"] + " <" + session["email"] +">"

    result=[]

    for event in data:
        role=""
        docs=[]
        for user in event["chairs"]:
            if key == user:
                role = role + "Chair "

        for doc in event["submissions"]: #cicliamo sui documenti
            for user in doc["reviewers"]:
                if key == user:
                    role = role + "Reviewer " #current usr is reviwer of this doc
            for user in doc["authors"]:
                if key == user:
                    role = role + "Author "
            if role:
                docs.append( {
                    "title": doc["title"],
                    "role": role,
                    "url": doc["url"]
                    })
            if role[:6]== "Chair ":
            	role = "Chair "
            else :
            	role=""
        if docs!=[] :
            result.append({
                "name" :  event["conference"],
                "docs" : docs[:]
            })
    return jsonify({'ret' : result})
