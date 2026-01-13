# ICP Grader

A web application for grading student project submissions using a customizable rubric. Graders evaluate them against defined criteria, with grades automatically saved to both JSON and Excel formats.

## Overview

This application provides:
- **PDF Browser**: Navigate student submissions organized by folders
- **Interactive Grader**: Grade submissions against a customizable rubric
- **Multi-format Output**: Grades saved to JSON and Excel spreadsheets
- **Rubric Management**: Easy-to-configure JSON-based grading criteria

## Prerequisites

- Python 3.8+
- Flask
- openpyxl (for Excel file handling)

## Setup Instructions

### 1. Create Virtual Environment

```bash
python -m venv venv
```

### 2. Activate Virtual Environment

**On Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**On Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install flask openpyxl
```

### 4. Prepare Project Structure

Ensure the following directories exist:
```
icp-grader/
├── documents/          # Student PDF submissions
├── grades/            # Output grades directory (will be created if doesnot exist)
├── static/
│   └── js/
├── templates/
├── app.py
├── grader.py
├── rubric.json
└── venv/
```

### 5. Configure Excel Template

Create `documents/grade_template.xlsx` with:
- **Grading Sheet** (worksheet name)
- Cell B2: Student name
- Cell B3: Student ID
- Cells C5-C14: Grade cells (matches rubric configuration)
- Cell A20 (Result sheet): Overall comment

The Excel cells must align with `excelCell` values in `rubric.json`.

### 6. Run Application

```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Project Structure

```
icp-grader/
├── app.py                          # Flask application and routes
├── grader.py                       # Core grading logic
├── rubric.json                     # Rubric definition and grading criteria
├── documents/                      # Student submission directories
│   ├── grade_template.xlsx         # Excel template for grade output
│   └── [StudentID StudentName]/    # Folder per student
│       ├── [StudentID]_[Name]_[Project].pdf
│       └── [StudentID] [Name].xlsx (generated)
├── grades/
│   └── all_grades.json             # Aggregated grades database
├── static/
│   └── js/
│       └── grader.js               # Frontend grading interface
├── templates/
│   ├── pdf-list.html               # PDF browser interface
│   ├── grading.html                # Grading interface
│   └── grade-summary.html          # Grade summary view
└── __pycache__/                    # Python cache
```

## Usage

### 1. Organizing Student Submissions

Place student PDF files in `documents/` folder with the naming convention:
```
documents/[StudentID StudentName]/[StudentID]_[LastName]_[ProjectName].pdf
```

Example:
```
documents/24040811 Avinav Shrestha/24040811_Avinav Shrestha_Project.pdf
```

### 2. Configuring the Rubric

Edit `rubric.json` to define grading criteria. Each rubric item should have:
- `marks`: Full marks for this criterion
- `excelCell`: Cell reference in Excel template (e.g., "C5")
- `comments`: Array of comment options for feedback

Example:
```json
{
  "Proposal": {
    "marks": 10,
    "excelCell": "C5",
    "comments": [
      "Proposal is clear, structured, and well-defined",
      "Proposal is clear but lacks some detail",
      "..."
    ]
  }
}
```

### 3. Grading Process

1. Open application at `http://localhost:5000`
2. Browse to student folder and select PDF
3. Click on PDF to open grading interface
4. For each rubric item:
   - Select marks awarded (0 to max marks)
   - Choose or enter comment
5. Submit grades - automatically saves to:
   - `grades/all_grades.json` (aggregated)
   - `documents/[StudentID] [Name].xlsx` (individual)

## API Endpoints

### GET `/`
Browse all student submissions

### GET `/browse/<path:subpath>`
Browse specific folder path

### GET `/grade/<path:filepath>`
Open grading interface for a PDF

### GET `/view/<path:filepath>`
View PDF file

### GET `/api/rubric`
Get rubric definition (JSON)

### POST `/grades`
Submit grades for a student
- **Request body:**
  ```json
  {
    "file_name": "24040811_Shrestha_Project.pdf",
    "rubric": {
      "Proposal": {"marks_awarded": 10, "comment": "..."},
      "..."
    }
  }
  ```

## Output Files

### Grades JSON (`grades/all_grades.json`)

```json
[
  {
    "student_id": "24040811",
    "student_name": "Avinav Shrestha",
    "file_path": "24040811_Shrestha_Project.pdf",
    "total_marks": 85,
    "rubric": {
      "Proposal": {"marks_awarded": 10, "comment": "..."},
      "..."
    },
    "overall_comment": "..."
  }
]
```

### Individual Excel Files

Generated in student submission folder with format: `[StudentID] [Name].xlsx`

## Troubleshooting

### Excel Template Issues
- Ensure `grade_template.xlsx` exists in `documents/`
- Verify worksheet is named "Grading Sheet"
- Check `excelCell` values in rubric match template layout

### PDF Not Found
- Verify PDF filename follows naming convention
- Check file is in correct subfolder
- Ensure path doesn't contain invalid characters

### Grades Not Saving
- Check `grades/` directory exists and is writable
- Verify JSON syntax in `rubric.json`
- Check Flask debug output for detailed error messages

## Development Notes

- Flask runs in debug mode by default
- Changes to `rubric.json` are reflected immediately
- Existing grades can be updated by re-submitting
- Student data is identified by student ID in filename
