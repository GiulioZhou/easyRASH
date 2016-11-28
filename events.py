from flask import Flask, request, jsonify
from easyRASH import app
from users import ret_url, get_static_json_file, session
from BeautifulSoup import BeautifulSoup, Tag
import json, os, logging

#Per il debugging import logging
#LOG_FILE = ret_url("err.log","")
#logging.basicConfig(filename=LOG_FILE, level=logging.DEBUG)
#try: fa qualcosa
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
                    "url": doc["url"],
                    "status": doc["status"]
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

@app.route('/api/getReviewers', methods=['GET'])
def reviewers():
    result=[]
    data = get_static_json_file("events.json")
    url = request.args.get('url')
    event = request.args.get('event')
    LOG_FILE = ret_url("err.log","")
    logging.basicConfig(filename=LOG_FILE, level=logging.DEBUG)
    try:
        for ev in data:
            if ev["conference"] == event:
                for paper in ev["submissions"]:
                    if paper["url"] == url:
                        result = paper["reviewers"]
                        break
                break
    except:
        logging.exception("exception")
        raise
    return jsonify({'ret' : result})

@app.route('/api/updateStatus', methods=['POST'])
def upStatus():
    json_data = request.json
    data = get_static_json_file("events.json")

    LOG_FILE = ret_url("err.log","")
    logging.basicConfig(filename=LOG_FILE, level=logging.DEBUG)
    try:
        for ev in data:
            if ev["conference"] == json_data["ev"]:
                for paper in ev["submissions"]:
                    if paper["url"] == json_data["paper"]:
                        paper["status"]=json_data["status"]
                        logging.debug(paper["status"])
                        with open(ret_url("events.json", "/json"), "w") as jfile:
                            jfile.write(json.dumps(data))
                            return jsonify({'ret' : True})
                        break
                break
    except:
        logging.exception("exception")
        raise
    return jsonify({'ret' : False})

@app.route('/api/save', methods=['POST'])
def save():
    json_data = request.json
    status = False
    data={}
    with open(ret_url(json_data["doc"],"/papers"), "r+") as inf:
        txt = inf.read()
        soup = BeautifulSoup(txt)
        #Solo se e' una review faccio queste modifiche, altrimenti se e' una decisione lo inserisce direttamente nell'head
        if json_data["type"] == "review": 
            #Controllo se lo script esiste o meno, se esiste lo elimino
            for script in soup.findAll("script",{"type":"application/ld+json"}):
                data = json.loads(script.text.strip())
                if data[0]["@type"] == "review":
                    if data[0]["article"]["eval"]["author"] == "mailto:"+json_data["author"]:
                        script.extract()
                        break
            #Rimuovo il contenuto del Body e lo riscrivo
            for section in soup.findAll("section"):
                section.extract()
            for section in json_data["sections"]:
                beauty = BeautifulSoup(section)
                logging.debug(section)
                soup.body.insert(len(soup.body.contents), beauty)
        #Creo lo script e lo inserisco
        new = Tag(soup, "script")
        new.attrs.append(("type", "application/ld+json"))
        new.string = json.dumps(json_data["script"])
        soup.head.insert(len(soup.head.contents), new)
        #Salvo il file
        html = soup.prettify("utf_8")
        inf.seek(0)
        inf.write(html)
        inf.truncate()
        inf.close()
    status=True 
    return jsonify({"result": status})