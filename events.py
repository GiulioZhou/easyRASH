from flask import Flask, request, jsonify
from easyRASH import app
from users import ret_url, get_static_json_file, session
from BeautifulSoup import BeautifulSoup, Tag
import json, os, logging

#Per il debugging import logging
#LOG_FILE = ret_url("err.log","")
#logging.basicConfig(filename=LOG_FILE, level=logging.DEBUG)
#Try: fa qualcosa
#except:
#   logging.exception("exception")
#   raise

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


@app.route('/api/save', methods=['POST'])
def save():
    json_data = request.json
    status = False
    data={}

    with open(ret_url(json_data["doc"],"/papers"), "r+") as inf:

        txt = inf.read()
        soup = BeautifulSoup(txt) 
        #Controllo se lo script esiste o meno, se esiste lo elimino
        for script in soup.findAll("script",{"type":"application/ld+json"}):
            data = json.loads(script.text.strip())
            if data[0]["@type"] == "review":
                if data[0]["article"]["eval"]["author"] == "mailto:"+json_data["author"]:
                    script.extract()
                    break
        #inserisco lo script
        new = Tag(soup, "script")
        new.attrs.append(("type", "application/ld+json"))
        new.string = json.dumps(json_data["script"])
        soup.head.insert(len(soup.head.contents), new)
        html = soup.prettify("utf_8")
        inf.seek(0)
        inf.write(html)
        inf.truncate()
        inf.close()

    status=True 
    return jsonify({"result": status})