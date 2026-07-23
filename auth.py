from flask import Blueprint, redirect, url_for, session, abort
from authlib.integrations.flask_client import OAuth
from functools import wraps
import os

auth_bp = Blueprint("auth", __name__)

oauth = OAuth()

google = oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url=
        "https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    }
)


def init_oauth(app):
    oauth.init_app(app)


@auth_bp.route("/login")
def login():
    return google.authorize_redirect(
        url_for("auth.callback", _external=True)
    )


@auth_bp.route("/auth/callback")
def callback():

    token = google.authorize_access_token()
    user = token["userinfo"]

    email = user.get("email", "")

    if not email.endswith("@icp.edu.np"):
        session.clear()
        return (
            "Access Denied. Only ICP email accounts are allowed.",
            403
        )

    session["user"] = {
        "name": user.get("name"),
        "email": email,
        "picture": user.get("picture")
    }

    return redirect("/dashboard")


@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect("/")

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if "user" not in session:
            return redirect("/")
        return f(*args, **kwargs)

    return decorated