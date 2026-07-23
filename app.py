from flask import Flask, redirect, render_template, send_from_directory, abort, jsonify, request, session
import os
from dotenv import load_dotenv
from auth import auth_bp, init_oauth, login_required

from grader import (
    list_directory,
    resolve_pdf,
    InvalidPath,
    NotFound,
    save_student_grade,
    process_rubric,
    is_graded
)

load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY")
# app.secret_key = "development-only-secret-key"

init_oauth(app)

app.register_blueprint(auth_bp)


@app.route("/")
def home():
    return render_template("login.html")

@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect("/")

    return render_template(
        "dashboard.html",
        user=session["user"]
    )

@app.route("/browse", defaults={"subpath": ""})
@app.route("/browse/<path:subpath>")
# @login_required
def browse(subpath):
    
    try:
        data = list_directory(subpath)
    except (InvalidPath, NotFound):
        abort(404)
    files = []

    for file in data["files"]:
        pdf_path = os.path.join(subpath, file) if subpath else file

        files.append({
            "name": file,
            "path": pdf_path,
            "graded": is_graded(pdf_path)
        })

    return render_template(
        "pdf-list.html",
        folders=data["folders"],
        files = files,
        subpath=subpath
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
    try:
        data = request.get_json()
        file_name = data.get("file_name")
        rubric = data.get("rubric")

        if not file_name or not rubric:
            return jsonify({"error": "Missing file name or rubric"}), 400

        student_data = save_student_grade(file_name, rubric)
        print("Saved grades for:", student_data["student_name"])
        return jsonify({
            "message": "Grades saved",
            "student_data": student_data
        }), 200

    except Exception as e:
        print("ERROR IN /grades:", e)   # <-- THIS WILL SHOW THE REAL BUG
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": str(e),
            "type": e.__class__.__name__
        }), 500

if __name__ == "__main__":
    app.run(debug=True)
