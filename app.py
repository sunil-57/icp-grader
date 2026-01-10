# app.py
from flask import Flask, render_template, send_from_directory, abort, jsonify, request

from grader import (
    list_directory,
    resolve_pdf,
    InvalidPath,
    NotFound,
    save_student_grade,
    process_rubric
)


app = Flask(__name__)


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
    return process_rubric()

@app.route("/grades", methods=["POST"])
def submit_grades():
    data = request.get_json()
    file_name = data.get("file_name")
    rubric = data.get("rubric")


    if not file_name or not rubric:
        return jsonify({"error": "Missing file name or rubric"}), 400

    student_data = save_student_grade(file_name, rubric)
    return jsonify({"message": "Grades saved", "student_data": student_data})


if __name__ == "__main__":
    app.run(debug=True)
