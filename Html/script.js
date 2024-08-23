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
        case 3:
        case 4:
            let title;
            if (stage === 2) title = "Pre-use checklist";
            else if (stage === 3) title = "Experimental procedure";
            else title = "Post-use checklist";
            
            stageContent.innerHTML = `
                <h2>${title} - ${selectedExperiment}</h2>
                <ul class="checklist" id="checklist"></ul>
            `;
            const checklist = document.getElementById('checklist');
            const tasks = getChecklist(selectedExperiment, selectedMicroscope, stage);
            currentTaskIndex = 0;
            renderTask(tasks, currentTaskIndex);

            document.addEventListener('keydown', handleKeyPress);
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
    console.log('Remarks saved');
}

function handleKeyPress(e) {
    if (currentStage >= 2 && currentStage <= 4) {
        const tasks = getChecklist(selectedExperiment, selectedMicroscope, currentStage);
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (currentTaskIndex < tasks.length - 1) {
                currentTaskIndex++;
                renderTask(tasks, currentTaskIndex);
            } else {
                completedStages.add(currentStage);
                nextButton.disabled = false;
                document.removeEventListener('keydown', handleKeyPress);
            }
        }
    }
}

function getChecklist(experiment, microscope, stage) {
    if (experiment === 'cell-density') {
        if (stage === 2) {
            let tasks = [
                "Plug in socket and turn on the power on the plug and on the back of the microscope.",
                "Ensure iris diaphragm is fully opened.",
                "Ensure condenser is fully lowered.",
                "Turn the coarse focus knob so that the stage is lowered fully.",
                "Rotate the 4x objective lens into position."
            ];
            if (microscope === 'halogen') {
                tasks.push("Allow the bulb to heat up for 5 minutes to achieve maximum brightness.");
            }
            return tasks;
        } else if (stage === 3) {
            return [
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
        } else if (stage === 4) {
            let tasks = [
                "Turn off the microscope",
                "Remove the microscope slide and clean up any spills",
                "Clean all objective lenses with a lens cloth, do not use any solvent",
                "Clean all eyepieces with a lens cloth, do not use any solvent",
                "Raise the stage up fully",
                "Place a dust cover over the microscope",
                "Log the storage date in the logbook."
            ];
            if (microscope === 'halogen') {
                tasks.unshift("Lower the brightness all the way down");
            }
            return tasks;
        }
    } else if (experiment === 'phase-contrast') {
        if (stage === 2) {
            return [
                "Plug in socket and turn on the power on the plug and on the back of the microscope.",
                "Ensure iris diaphragm is fully opened.",
                "Ensure condenser is fully lowered.",
                "Mount the phase contrast condenser.",
                "Insert the phase contrast slider or turret.",
                "Turn the coarse focus knob so that the stage is lowered fully.",
                "Remove all non phase contrast objective lenses",
                "Replace the objective lenses with phase contrast objective lens",
                "Check the phase rings alignment by looking through the eyepiece or use a phase telescope to ensure the phase rings in the objective and condenser are aligned.",
                "Choose the correct phase annulus by rotating the phase slider or turret to the position that matches the objective lens in use."
            ];
        } else if (stage === 3) {
            return ["Nothing to do here"];
        } else if (stage === 4) {
            return [
                "Turn off the microscope",
                "Remove the microscope slide and clean up any spills",
                "Clean all objective lenses with a lens cloth, do not use any solvent",
                "Clean all eyepieces with a lens cloth, do not use any solvent",
                "Raise the stage up fully",
                "Remove the phase slider, phase turret and phase contrast condenser and place them in protective case",
                "Place a dust cover over the microscope",
                "Log the storage date in the logbook."
            ];
        }
    } else if (experiment === 'fluorescence') {
        if (stage === 2) {
            return [
                "Ensure the room is dimly lit",
                "Plug in socket and turn on the power on the plug and on the back of the microscope.",
                "Install the fluorescent lamp into the microscope",
                "Twist the adjustment screws to align the lamp to provide even light",
                "Install fluorescent filter in the correct filter cubes",
                "Align the dichroic mirrors to match the excitation and emission wavelengths",
                "Set up Köhler illumination: Close the field diaphragm and adjust the condenser height until the edges of the diaphragm are in sharp focus",
                "Use the centering screws on the condenser to center the illuminated area",
                "Open the field diaphragm until it just fills the field of view",
                "Ensure iris diaphragm is fully opened",
                "Ensure condenser is fully lowered",
                "Turn the coarse focus knob so that the stage is lowered fully",
                "Rotate the 4x objective lens into position"
            ];
        } else if (stage === 3) {
            return [
                "Always wear UV protective eyewear when working with UV light sources",
                "Avoid looking directly at the light source",
                "Start with the lowest light intensity to avoid photobleaching"
            ];
        } else if (stage === 4) {
            return [
                "Lower the brightness all the way down",
                "Turn off the microscope",
                "Allow the lamp to cool down",
                "Remove the microscope slide and clean up any spills",
                "Clean all objective lenses with a lens cloth, do not use any solvent",
                "Clean all eyepieces with a lens cloth, do not use any solvent",
                "Raise the stage up fully",
                "Remove filters and light sources and store them separately in their protective cases",
                "Place a dust cover over the microscope",
                "Log the storage date in the logbook."
            ];
        }
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