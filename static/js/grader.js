let RUBRIC = {};
let RUBRIC_KEYS = [];
let currentIndex = 0;

async function loadRubric() {
    const response = await fetch("/api/rubric");
    const data = await response.json();

    RUBRIC = data.rubric;
    RUBRIC_KEYS = data.keys;

    console.log(RUBRIC, RUBRIC_KEYS);
    updateDisplay();
}

function updateDisplay() {
    const currentKey = RUBRIC_KEYS[currentIndex];
    const currentRubric = RUBRIC[currentKey];

    if (!currentRubric) return;

    document.getElementById('criterion-title').textContent = currentKey;
    document.getElementById('total-marks').textContent = currentRubric.marks;

    const commentsContainer = document.getElementById('comments-container');
    commentsContainer.innerHTML = '';

    currentRubric.comments.forEach((comment, index) => {
        const label = document.createElement('label');
        label.className = 'flex items-center gap-2 p-2 m-2 border-2 rounded-lg cursor-pointer';
        label.innerHTML = `
          <input type="radio" name="grade_${currentKey}" value="${index}">
          ${comment}
        `;
        commentsContainer.appendChild(label);
    });

    document.getElementById('prev-btn').disabled = currentIndex === 0;

    if (currentIndex === RUBRIC_KEYS.length - 1) {
        document.getElementById('next-btn').classList.add('hidden');
        document.getElementById('done-btn').classList.remove('hidden');
    } else {
        document.getElementById('next-btn').classList.remove('hidden');
        document.getElementById('done-btn').classList.add('hidden');
    }
}

document.addEventListener("DOMContentLoaded", () => {

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateDisplay();
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        if (currentIndex < RUBRIC_KEYS.length - 1) {
            currentIndex++;
            updateDisplay();
        }
    });

    document.getElementById('done-btn').addEventListener('click', () => {
        window.location.href = '/';
    });

    loadRubric();
});
