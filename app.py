import os
import sys
import csv
import random
import gc
from flask import Flask, render_template, request, jsonify, redirect
from ua_g2p import ProcessorG2P
import webview
import threading

def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

app = Flask(
    __name__,
    static_folder=resource_path("static"),
    template_folder=resource_path("templates")
)
g2p = ProcessorG2P()

def run_flask():
    app.run(port=5000, debug=False, use_reloader=False)

def load_placeholders(path):
    placeholders = []

    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            placeholders.append(row)
        
    return placeholders 

PLACEHOLDERS_LIST = load_placeholders(resource_path("placeholders.csv"))

@app.route('/')
def home():
    return redirect('/g2p')

@app.route('/g2p')
def index():
    placeholder = random.choice(PLACEHOLDERS_LIST)

    return render_template(
        'g2p.html',
        input_placeholder=placeholder["text"], 
        output_placeholder=placeholder["transcription"] 
    )

@app.route('/g2p/transcribe', methods=['POST'])
def transcribe():
    data = request.json
    text = data.get('text', '')
    accentor = data.get('accentor', 'dictionary')
    mode = data.get('mode', 'ipa')
    
    if not text.strip():
        return jsonify({'result': ''})
    
    try:
        result = g2p(
            text=text,
            accentor=accentor,
            mode=mode,
            brackets=True
        )
        gc.collect()
        return jsonify({'result': result})
    except Exception as e:
        print(e)
        gc.collect()
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    t = threading.Thread(target=run_flask)
    t.daemon = True
    t.start()

    webview.create_window(
        'PHONETICS LAB UA', 
        'http://127.0.0.1:5000/',
        width=1600, 
        height=1200,
        resizable=True
    )
    
    basedir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(basedir, 'gui_data')

    webview.start(
        icon='static/icon.png',
        storage_path=data_dir
    )