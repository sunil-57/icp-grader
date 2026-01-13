let RUBRIC = {};
let RUBRIC_KEYS = [];
let currentIndex = 0;
let totalObtained = 0;
const rubricGrades = {};

async function loadRubric() {
    const response = await fetch("/api/rubric");
    const data = await response.json();

    RUBRIC = data.rubric;
    RUBRIC_KEYS = data.keys;

    console.log(RUBRIC, RUBRIC_KEYS);
    updateDisplay();
}

async function submitGrades() {
    const iframe = document.getElementById("pdf-viewer");
    const FILE_PATH = iframe ? iframe.getAttribute("src").split("/view/")[1] : "";

    console.log("Final rubric grades to submit:", rubricGrades);

    const payload = {
        file_name: decodeURIComponent(FILE_PATH),
        rubric: rubricGrades
    };

    try {
        const response = await fetch("/grades", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Grades saved successfully!");
        } else {
            const text = await response.text();
            console.error("Error response:", text);
            alert("Error saving grades. See console.");
        }
    } catch (err) {
        console.error("Submit failed:", err);
        alert(err.message || "Failed to save grades");
    }
}


function handleCheckboxCommentLock(currentKey) {
    const commentInput = document.getElementById("comment-input");
    const checkboxes = document.querySelectorAll(`input[name="grade_${currentKey}"]`);

    checkboxes.forEach(box => {
        box.addEventListener("change", () => {
            if (box.checked) {
                checkboxes.forEach(cb => {
                    if (cb !== box) cb.checked = false;
                });
                commentInput.disabled = true;
                commentInput.value = "";
                commentInput.placeholder = "Deselect the checkbox to enter comment";
            } else {
                commentInput.disabled = false;
                commentInput.placeholder = "Enter comment here";
            }
        });
    });
}

function updateDisplay() {
    const currentKey = RUBRIC_KEYS[currentIndex];
    const currentRubric = RUBRIC[currentKey];
    const marksInput = document.getElementById("marks-input");

    if (!currentRubric) return;

    if (marksInput && currentKey && RUBRIC[currentKey]) {
        marksInput.max = RUBRIC[currentKey].marks;
    }

    document.getElementById('criterion-title').textContent = currentKey;
    document.getElementById('total-marks').textContent = currentRubric.marks;

    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';

    currentRubric.comments.forEach((comment, index) => {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-2 p-2 border-2 rounded-lg cursor-pointer';
        label.innerHTML = `
            <input type="checkbox" name="grade_${currentKey}" value="${index}">
            ${comment}
        `;
        commentsContainer.appendChild(label);
    });

    const commentInput = document.getElementById("comment-input");
    commentInput.placeholder = "Enter comment here";
    commentInput.disabled = false;

    handleCheckboxCommentLock(currentKey);

    document.getElementById('prev-btn').disabled = currentIndex === 0;

    if (currentIndex === RUBRIC_KEYS.length - 1) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('done-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('done-btn').classList.add('hidden');
    }
}

function saveCurrentRubric(currentIndex) {
    const currentKey = RUBRIC_KEYS[currentIndex];
    const selectedInput = document.querySelector(
        `input[name="grade_${currentKey}"]:checked`
    );

    const marksInput = document.getElementById("marks-input");
    const commentInput = document.getElementById("comment-input");

    rubricGrades[currentKey] = {
        marks_awarded: marksInput? Math.min(parseInt(marksInput.value) || 0, RUBRIC[currentKey].marks): 0,
        comment: commentInput.value? 
                commentInput.value: selectedInput? RUBRIC[currentKey].comments[selectedInput.value]: ""
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const marksInput = document.getElementById("marks-input");
    const marksError = document.getElementById("marks-error");
    const obtainedMarksDisplay = document.getElementById("obtained-marks");
    const commentInput = document.getElementById("comment-input");

    marksInput.addEventListener("input", () => {
        const currentKey = RUBRIC_KEYS[currentIndex];
        const max = currentKey && RUBRIC[currentKey] ? RUBRIC[currentKey].marks : null;

        if (max !== null && parseInt(marksInput.value) > max) {
            marksError.classList.remove("hidden");
        } else {
            marksError.classList.add("hidden");
        }

        obtainedMarksDisplay.textContent = marksInput.value || '0';
    });

    commentInput.addEventListener("focus", () => {
        const currentKey = RUBRIC_KEYS[currentIndex];
        if (!currentKey) return;

        const checkboxes = document.querySelectorAll(`input[name="grade_${currentKey}"]`);
        checkboxes.forEach(cb => cb.checked = false);
        commentInput.disabled = false;
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentIndex > 0) {
            saveCurrentRubric(currentIndex);
            currentIndex--;
            updateDisplay();
        }
        obtainedMarksDisplay.textContent = marksInput.value || '0';
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentIndex < RUBRIC_KEYS.length - 1) {
            saveCurrentRubric(currentIndex);
            currentIndex++;
            updateDisplay();
        }
        obtainedMarksDisplay.textContent = marksInput.value || '0';
    });

    document.getElementById('done-btn').addEventListener('click', async () => {
        await submitGrades();
    });

    loadRubric();
});
