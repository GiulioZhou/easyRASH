from flask import Response, request, render_template, send_from_directory
from easyRASH import app

@app.route('/', methods=['GET', 'POST'])
def index():
	return render_template('index.html')

@app.route('/home', methods=['GET', 'POST'])
def base():
	return render_template('base.html')
