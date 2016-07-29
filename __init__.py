from flask import Flask, render_template
import json

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def index():
	return render_template('index.html')

@app.route('/home', methods=['GET', 'POST'])
def base():
	return render_template('base.html')


if __name__ == '__main__':
	app.run(debug=True)
