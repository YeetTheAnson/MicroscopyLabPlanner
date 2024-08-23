const stageContent = document.getElementById('stage-content');
const nextButton = document.getElementById('next-button');
const progressStages = document.querySelectorAll('.progress-stage');
let currentStage = 1;
let selectedExperiment = '';
let selectedMicroscope = '';
let completedStages = new Set();
let currentTaskIndex = 0;

function updateStage(stage) {
    if (stage > currentStage && !canProgressToStage(stage)) {
        return;
    }

    currentStage = stage;
    progressStages.forEach(el => {
        el.classList.remove('active');
        if (parseInt(el.dataset.stage) < stage) {
            el.classList.add('completed');
        } else {
            el.classList.remove('completed');
        }
    });
    document.querySelector(`.progress-stage[data-stage="${stage}"]`).classList.add('active');
    renderStageContent(stage);
}

function canProgressToStage(stage) {
    if (stage === 1) return true;
    if (stage === 2) return selectedExperiment !== '';
    if (stage === 3) return completedStages.has(2);
    if (stage === 4) return completedStages.has(3);
    return false;
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
                <div id="microscope-select-container" style="display: none;">
                    <select id="microscope-select">
                        <option value="">Choose microscope</option>
                        <option value="led">LED Microscope</option>
                        <option value="halogen">Halogen Lamp Microscope</option>
                    </select>
                </div>
            `;
            const experimentSelect = document.getElementById('experiment-select');
            const microscopeSelectContainer = document.getElementById('microscope-select-container');
            const microscopeSelect = document.getElementById('microscope-select');

            experimentSelect.value = selectedExperiment;
            microscopeSelect.value = selectedMicroscope;

            experimentSelect.addEventListener('change', function() {
                selectedExperiment = this.value;
                if (this.value === 'cell-density') {
                    microscopeSelectContainer.style.display = 'block';
                } else {
                    microscopeSelectContainer.style.display = 'none';
                    selectedMicroscope = '';
                }
                updateNextButtonState();
            });

            microscopeSelect.addEventListener('change', function() {
                selectedMicroscope = this.value;
                updateNextButtonState();
            });

            function updateNextButtonState() {
                if (selectedExperiment === 'cell-density') {
                    nextButton.disabled = selectedExperiment === '' || selectedMicroscope === '';
                } else {
                    nextButton.disabled = selectedExperiment === '';
                }

                if (!nextButton.disabled) {
                    completedStages.add(1);
                } else {
                    completedStages.delete(1);
                }
            }

            updateNextButtonState();
            break;
        case 2:
            stageContent.innerHTML = `
                <h2>Pre-use checklist - ${selectedExperiment}</h2>
                <ul class="checklist" id="checklist"></ul>
            `;
            const checklist = document.getElementById('checklist');
            const tasks = getChecklist(selectedExperiment, selectedMicroscope);
            currentTaskIndex = 0;
            renderTask(tasks, currentTaskIndex);

            document.addEventListener('keydown', handleKeyPress);
            break;
        case 3:
            stageContent.innerHTML = `<h2>Stage 3: ${selectedExperiment}</h2>`;
            nextButton.disabled = false;
            completedStages.add(3);
            break;
        case 4:
            stageContent.innerHTML = `<h2>Stage 4: ${selectedExperiment}</h2>`;
            nextButton.disabled = true;
            completedStages.add(4);
            break;
    }
}

function renderTask(tasks, index) {
    const checklist = document.getElementById('checklist');
    checklist.innerHTML = '';

    tasks.forEach((task, i) => {
        const li = document.createElement('li');
        li.className = `checklist-item ${i < index ? 'completed' : i > index ? 'blurred' : ''}`;
        li.innerHTML = `
            <div class="checklist-item-content">
                <input type="checkbox" id="task-${i}" ${i <= index ? 'checked' : ''}>
                <label for="task-${i}">${task}</label>
            </div>
            <div class="remarks-container">
                <textarea class="remarks-input" placeholder="Add remarks (optional)"></textarea>
                <button class="save-remarks">Save Remarks</button>
            </div>
        `;
        checklist.appendChild(li);
    });

    const currentItem = checklist.children[index];
    if (currentItem) {
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const saveRemarksButton = checklist.querySelector('.save-remarks');
    if (saveRemarksButton) {
        saveRemarksButton.addEventListener('click', saveRemarks);
    }
}

function saveRemarks() {
    // Here you can add logic to save the remarks
    console.log('Remarks saved');
}

function handleKeyPress(e) {
    if (currentStage === 2) {
        const tasks = getChecklist(selectedExperiment, selectedMicroscope);
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (currentTaskIndex < tasks.length - 1) {
                currentTaskIndex++;
                renderTask(tasks, currentTaskIndex);
            } else {
                completedStages.add(2);
                nextButton.disabled = false;
                document.removeEventListener('keydown', handleKeyPress);
            }
        }
    }
}

function getChecklist(experiment, microscope) {
    if (experiment === 'cell-density' && microscope === 'led') {
        return [
            "Plug in socket and turn on the power on the plug and on the back of the microscope.",
            "Ensure iris diaphragm is fully opened.",
            "Ensure condenser is fully lowered.",
            "Turn the coarse focus knob so that the stage is lowered fully.",
            "Rotate the 4x objective lens into position.",
            "Prepare cell sample with water and put on a glass slide.",
            "Drop a glass slip on top, ensuring air bubbles do not get trapped.",
            "Load glass slide onto microscope stage.",
            "Move glass slide so that the light is focused on the centre of the cell sample.",
            "Look into eyepiece.",
            "Slowly raise the stage by slowly turning coarse focus knob until cells come into view and into focus.",
            "Count the number of cells.",
            "Calculate area of field of view.",
            "Divide number of cells by area to obtain cell density."
        ];
    } else if (experiment === 'fluorescence') {
        return ["Placeholder task 1 for fluorescence imaging", "Placeholder task 2 for fluorescence imaging"];
    } else if (experiment === 'phase-contrast') {
        return ["Placeholder task 1 for phase contrast imaging", "Placeholder task 2 for phase contrast imaging"];
    }
    return [];
}

nextButton.addEventListener('click', function() {
    if (currentStage < 4) {
        updateStage(currentStage + 1);
    }
});

progressStages.forEach(stage => {
    stage.addEventListener('click', function() {
        const clickedStage = parseInt(this.dataset.stage);
        if (canProgressToStage(clickedStage)) {
            updateStage(clickedStage);
        }
    });
});

updateStage(1);