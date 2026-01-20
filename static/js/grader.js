let RUBRIC = {};
let MARKS_BY_KEY = {};
let RUBRIC_KEYS = [];
let currentIndex = 0;

function updateTotalObtained() {
    const total = Object.values(MARKS_BY_KEY).reduce((sum, v) => sum + v, 0);
    document.getElementById("obtained-marks").textContent = total;
}

async function loadRubric() {
    const response = await fetch("/api/rubric");
    const data = await response.json();

    RUBRIC = data.rubric;
    RUBRIC_KEYS = data.keys;

    updateDisplay();
    updateTotalObtained();
}

async function submitGrades() {
    const rubricGrades = {};
    const iframe = document.getElementById("pdf-viewer");
    const FILE_PATH = iframe ? iframe.getAttribute("src").split("/view/")[1] : "";

    RUBRIC_KEYS.forEach((key) => {
        const selectedInput = document.querySelector(`input[name="grade_${key}"]:checked`);
        const commentInput = document.getElementById("comment-input");

        rubricGrades[key] = {
            marks_awarded: MARKS_BY_KEY[key] || 0,
            comment: commentInput
                ? commentInput.value || (selectedInput ? RUBRIC[key].comments[selectedInput.value] : "")
                : ""
        };
    });

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

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text);
        }

        alert("Grades saved successfully!");
    } catch (err) {
        alert(err.message || "Failed to save grades");
    }
}

function updateDisplay() {
    const currentKey = RUBRIC_KEYS[currentIndex];
    const currentRubric = RUBRIC[currentKey];
    const marksInput = document.getElementById("marks-input");

    if (!currentRubric) return;

    marksInput.max = currentRubric.marks;
    marksInput.value = MARKS_BY_KEY[currentKey] ?? "";

    document.getElementById("criterion-title").textContent = currentKey;
    document.getElementById("total-marks").textContent = currentRubric.marks;

    const commentsContainer = document.getElementById("comments-container");
    commentsContainer.innerHTML = "";

    currentRubric.comments.forEach((comment, index) => {
        const label = document.createElement("label");
        label.className = "flex items-center gap-2 p-2 m-2 border-2 rounded-lg cursor-pointer";
        label.innerHTML = `
            <input type="radio" name="grade_${currentKey}" value="${index}">
            ${comment}
        `;
        commentsContainer.appendChild(label);
    });

    document.getElementById("prev-btn").disabled = currentIndex === 0;

    if (currentIndex === RUBRIC_KEYS.length - 1) {
        document.getElementById("next-btn").classList.add("hidden");
        document.getElementById("done-btn").classList.remove("hidden");
    } else {
        document.getElementById("next-btn").classList.remove("hidden");
        document.getElementById("done-btn").classList.add("hidden");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const marksInput = document.getElementById("marks-input");
    const marksError = document.getElementById("marks-error");

    marksInput.addEventListener("input", () => {
        const currentKey = RUBRIC_KEYS[currentIndex];
        if (!currentKey) return;

        const max = RUBRIC[currentKey].marks;
        const value = Math.min(parseInt(marksInput.value) || 0, max);

        marksInput.value = value;
        MARKS_BY_KEY[currentKey] = value;

        if (value > max) {
            marksError.classList.remove("hidden");
        } else {
            marksError.classList.add("hidden");
        }

        updateTotalObtained();
    });

    document.getElementById("prev-btn").addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateDisplay();
        }
        updateTotalObtained();
    });

    document.getElementById("next-btn").addEventListener("click", () => {
        if (currentIndex < RUBRIC_KEYS.length - 1) {
            currentIndex++;
            updateDisplay();
        }
        updateTotalObtained();
    });

    document.getElementById("done-btn").addEventListener("click", async () => {
        await submitGrades();
        window.location.href = "/";
    });

    loadRubric();
});
