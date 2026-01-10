# grader.py
import os

BASE_PDF_DIR = os.path.abspath("pdfs")


class InvalidPath(Exception):
    pass


class NotFound(Exception):
    pass


def safe_path(subpath):
    full_path = os.path.abspath(os.path.join(BASE_PDF_DIR, subpath))
    if not full_path.startswith(BASE_PDF_DIR):
        raise InvalidPath("Invalid path access")
    return full_path


def list_directory(subpath):
    current_dir = safe_path(subpath)

    if not os.path.isdir(current_dir):
        raise NotFound("Directory not found")

    folders, pdfs = [], []

    for item in os.listdir(current_dir):
        item_path = os.path.join(current_dir, item)
        if os.path.isdir(item_path):
            folders.append(item)
        elif item.lower().endswith(".pdf"):
            pdfs.append(item)

    return {
        "folders": sorted(folders),
        "files": sorted(pdfs),
    }


def resolve_pdf(subpath, filename):
    full_path = safe_path(os.path.join(subpath, filename))

    if not full_path.lower().endswith(".pdf"):
        raise NotFound("Not a PDF file")

    if not os.path.exists(full_path):
        raise NotFound("PDF not found")

    directory, file = os.path.split(full_path)
    return directory, file


