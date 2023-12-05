const arrayContainer = document.getElementById("array-container");
let array = [];

let transitionSpeed = 300;
let curAlgorithm = "";

// Generate a simple maze (for now, just random walls)

document.getElementById('speedRange').addEventListener('input', function() {
    transitionSpeed = 300 - parseInt(this.value);
});

// Call this function once the sorting is complete
function waveColor(color) {
    const bars = document.querySelectorAll(".bar");
    bars.forEach((bar, index) => {
        // Delay the color change for each bar to create a wave effect
        setTimeout(() => {
            bar.style.backgroundColor = color; // Change to your desired "wave" color
        }, index * 20); // Increase the delay for each subsequent bar
    });
}


function generateArray() {
    arrayContainer.innerHTML = "";
    for (let i = 0; i < 50; i++) {
        array[i] = Math.floor(Math.random() * 300) + 1;
        const bar = document.createElement("div");
        bar.style.height = `${array[i]}px`;
        bar.classList.add("bar");
        bar.style.width = '30px';
        arrayContainer.appendChild(bar);
    }
}
function disableButtons() {
    algList = ["Bubble", "Merge","Quick"]
    let undoAlgList = algList.filter(item => item !== curAlgorithm);

    document.querySelectorAll(".button-36").forEach(button => {
        if(undoAlgList.some(item => button.textContent.includes(item)))
            button.disabled = true;
    });
}
function enableButtons() {
    curAlgorithm = ""
    document.querySelectorAll(".button-36").forEach(button => {
        button.disabled = false;
    });
}
async function bubbleSort() {
    curAlgorithm = "Bubble";
    disableButtons();
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            if (array[j] > array[j + 1]) {
                // Swap
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;

                // Update UI
                updateUI(j, j + 1);
                await new Promise(resolve => setTimeout(resolve, transitionSpeed));
            }
        }
    }
    waveColor('#932F6D');
    enableButtons();
}

async function mergeSort(array, l, r) {
    if (l >= r) {
        return; // Returns recursively
    }
    var m = l + parseInt((r - l) / 2);
    await mergeSort(array, l, m);
    await mergeSort(array, m + 1, r);
    await merge(array, l, m, r);
}

// Merging two halves
async function merge(array, l, m, r) {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);

    for (let i = 0; i < n1; i++) {
        L[i] = array[l + i];
    }
    for (let j = 0; j < n2; j++) {
        R[j] = array[m + 1 + j];
    }

    let i = 0, j = 0, k = l;

    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            array[k] = L[i];
            i++;
        } else {
            array[k] = R[j];
            j++;
        }
        await updateBar(k, array[k]);
        k++;
    }

    while (i < n1) {
        array[k] = L[i];
        await updateBar(k, array[k]);
        i++;
        k++;
    }

    while (j < n2) {
        array[k] = R[j];
        await updateBar(k, array[k]);
        j++;
        k++;
    }
}

// Update a single bar's height and color
async function updateBar(index, height) {
    let bars = document.querySelectorAll(".bar");
    bars[index].style.height = `${height}px`;
    bars[index].style.backgroundColor = "red";
    await new Promise(resolve => setTimeout(resolve, transitionSpeed));
    bars[index].style.backgroundColor = "blue";
}

// Start Merge Sort
async function startMergeSort() {
    curAlgorithm = "Merge";
    disableButtons();
    await mergeSort(array, 0, array.length - 1);
    waveColor('#932F6D');
    enableButtons();
}

async function partition(array, low, high) {
    let pivot = array[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        if (array[j] < pivot) {
            i++;
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
            updateUI(i, j);
            await new Promise(resolve => setTimeout(resolve, transitionSpeed));
        }
    }
    let temp = array[i + 1];
    array[i + 1] = array[high];
    array[high] = temp;
    updateUI(i + 1, high);
    await new Promise(resolve => setTimeout(resolve, transitionSpeed));
    return i + 1;
}

async function quickSort(array, low, high) {
    if (low < high) {
        let pi = await partition(array, low, high);
        await quickSort(array, low, pi - 1);
        await quickSort(array, pi + 1, high);
    }
}

async function InsertionSort(array) {
    for (let i = 0; i < array.length; i++) {
        let min = i;
        for (let j = i + 1; j < array.length; j++) {
            if (array[min] > array[j]) {
                min = j;
            }
        }
        let temp = array[min];
        array[min] = array[i];
        array[i] = temp;
        updateUI(i, min);
        await new Promise(resolve => setTimeout(resolve, transitionSpeed));
    }
}


async function startInsertionSort() {
    await InsertionSort(array);
    waveColor('#932F6D');
}

async function startQuickSort() {
    curAlgorithm = "Quick";
    disableButtons();
    await quickSort(array, 0, array.length - 1)
    waveColor('#932F6D');
    enableButtons();
}

function updateUI(index1, index2) {
    let bars = document.querySelectorAll(".bar");
    bars[index1].style.height = `${array[index1]}px`;
    bars[index2].style.height = `${array[index2]}px`;
}

function updateArray() {
    array = [];
    for (let i = 0; i < 50; i++) {
        array[i] = Math.floor(Math.random() * 300) + 1;
    }
}

async function stopSorting() {
    stop();
}


function stop() {
    window.location.reload();
}

window.onload = generateArray;


