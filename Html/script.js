const stageContent = document.getElementById('stage-content');
const nextButton = document.getElementById('next-button');
let currentStage = 1;
let selectedExperiment = '';

function updateStage(stage) {
    currentStage = stage;
    document.querySelectorAll('.progress-stage').forEach(el => {
        el.classList.remove('active');
    });
    document.querySelector(`.progress-stage[data-stage="${stage}"]`).classList.add('active');
    renderStageContent(stage);
}

function renderStageContent(stage) {
    switch (stage) {
        case 1:
            stageContent.innerHTML = `
                <select id="experiment-select">
                    <option value="">Choose experiment</option>
                    <option value="cell-density">Cell density counting</option>
                    <option value="fluorescence">Fluorescence imaging</option>
                    <option value="phase-contrast">Phase contrast imaging</option>
                </select>
            `;
            const experimentSelect = document.getElementById('experiment-select');
            experimentSelect.addEventListener('change', function() {
                selectedExperiment = this.value;
                nextButton.disabled = this.value === '';
            });
            break;
        case 2:
            stageContent.innerHTML = `<h2>Stage 2: ${selectedExperiment}</h2>`;
            nextButton.disabled = false;
            break;
        case 3:
            stageContent.innerHTML = `<h2>Stage 3: ${selectedExperiment}</h2>`;
            nextButton.disabled = false;
            break;
        case 4:
            stageContent.innerHTML = `<h2>Stage 4: ${selectedExperiment}</h2>`;
            nextButton.disabled = true;
            break;
    }
}

nextButton.addEventListener('click', function() {
    if (currentStage < 4) {
        updateStage(currentStage + 1);
    }
});

updateStage(1);