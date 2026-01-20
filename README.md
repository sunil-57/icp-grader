# ICP Grader

A web application for grading student project submissions using a customizable rubric. Graders evaluate them against defined criteria, with grades automatically saved to both JSON and Excel formats provided by the college.

## Overview

This application provides:
- **PDF Browser**: Navigate student submissions organized by folders
- **Interactive Grader**: Grade submissions against a customizable rubric
- **Multi-format Output**: Grades saved to JSON and Excel spreadsheets `[saved in json, such that it might come handy as the student data is kept in one place i.e. analytics, or export in another excel sheet or might other functions that I might be ignoring or which has not crossed my mind. A better solution could just create a google sheet instead of a local excel sheet because we ultimately have to share the excel files to the google drive after grading the coursework]`
- **Rubric Management**: Easy-to-configure JSON-based grading criteria `[need to work on this, currently have to change the json without using the system]`

## Prerequisites

- Python 3.8+
- Flask
- openpyxl (for Excel file handling)

## Setup Instructions and Configuration

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
├── grades/            # Output grades directory
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

>  Above configuration is shown as per the template for the module that I teach. 
>
> Different modules have different structure and criterias. 
> 
> It needs to be configured in the `rubric.json`.

**NOTE:**
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
documents/[London Met Id_StudentName]/[London Met Id_[LastName]_[ProjectName].pd
```

Example:
```
documents/24040811 Avinav Shrestha/24040811_Avinav Shrestha_Project.pdf
```

### 2. Configuring the Rubric

Edit `rubric.json` to define grading criteria. Each rubric item should have:
- `marks`: Full marks for this criterion
- `excelCell`: Cell reference in Excel template where the awarded marks should be written(e.g., "C5")
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
   - `documents/London Met ID Name/London Met ID_Name.xlsx` (individual)

**Note:** It will give `404` not found error, if the documents folder is not configured, so it should be handled before. Well, yes, it needs to be handled but initially it is focused on grading the paper only.
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
- Student data is identified by London Met ID in filename
