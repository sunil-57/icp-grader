# app.py
from flask import Flask, render_template, send_from_directory, abort, jsonify
from grader import (
    list_directory,
    resolve_pdf,
    InvalidPath,
    NotFound,
)
import json

app = Flask(__name__)

with open('rubric.json', 'r') as f:
    RUBRIC = json.load(f)
    
RUBRIC_KEYS = list(RUBRIC.keys())

@app.route("/", defaults={"subpath": "", "selected": None})
@app.route("/browse/<path:subpath>", defaults={"selected": None})
@app.route("/browse/<path:subpath>/<path:selected>")
def browse(subpath, selected):
    try:
        data = list_directory(subpath)
    except (InvalidPath, NotFound):
        abort(404)

    selected_pdf = None
    if selected:
        selected_pdf = f"{subpath}/{selected}" if subpath else selected

    return render_template(
        "pdf-list.html",
        folders=data["folders"],
        files=data["files"],
        subpath=subpath,
        selected_pdf=selected_pdf
    )


@app.route("/view/<path:filepath>")
def view_pdf(filepath):
    try:
        directory, filename = resolve_pdf("", filepath)
    except (InvalidPath, NotFound):
        abort(404)

    return send_from_directory(directory, filename, mimetype="application/pdf")


@app.route("/grade/<path:filepath>")
def grade(filepath):
    return render_template(
        "grading.html",
        filepath=filepath
    )

@app.route("/api/rubric")
def rubric_api():
    return jsonify({
        "rubric": RUBRIC,
        "keys": RUBRIC_KEYS
    })   
    
if __name__ == "__main__":
    app.run(debug=True)
