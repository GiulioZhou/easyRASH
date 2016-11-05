from flask import Flask, render_template, session
import json

app = Flask(__name__)

app.config['SESSION_TYPE'] = 'memcached'
app.config['SECRET_KEY'] = 'super secret key'

from easyRASH import views, users, events
