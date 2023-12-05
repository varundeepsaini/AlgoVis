const mazeContainer = document.getElementById("maze-container");
const ROWS = 20;
const COLS = 40;
let maze = [];

let transitionSpeed = 300;
let curAlgorithm = "";

document.getElementById('speedRange').addEventListener('input', function() {
    transitionSpeed = 300 - parseInt(this.value);
});


function addWalls() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j ++) {
            if (Math.random() < 0.3) {
                maze[i][j].classList.add("wall");
            }
        }
    }
    maze[0][0].classList.remove("wall");
    maze[ROWS-1][COLS-1].classList.remove("wall");
}


function generateMaze() {
    mazeContainer.innerHTML = "";
    for (let i = 0; i < ROWS; i++) {
        maze[i] = [];
        for (let j = 0; j < COLS; j++) {
            maze[i][j] = document.createElement("div");
            maze[i][j].classList.add("cell");
            mazeContainer.appendChild(maze[i][j]);
        }
    }
    addWalls();
}

// BFS Algorithm
async function bfs(startRow, startCol, goalRow, goalCol) {
    let queue = [[startRow, startCol, null]]; // Queue elements are [row, col, parent]
    let visited = new Map(); // To keep track of visited cells and their parents
    let foundGoal = false;

    while (queue.length > 0 && !foundGoal) {
        let [row, col, parent] = queue.shift();

        if (row < 0 || col < 0 || row >= ROWS || col >= COLS || maze[row][col].classList.contains("visited") || maze[row][col].classList.contains("wall")) {
            continue;
        }

        maze[row][col].classList.add("visited");
        visited.set(maze[row][col], parent);

        if (row === goalRow && col === goalCol) {
            foundGoal = true;
            break; // Stop when goal is reached
            
        }

        // Add adjacent cells to queue
        queue.push([row, col + 1, maze[row][col]]); // Right
        queue.push([row + 1, col, maze[row][col]]); // Down
        queue.push([row, col - 1, maze[row][col]]); // Left
        queue.push([row - 1, col, maze[row][col]]); // Up
        // Inside your BFS step (and similarly in other search functions)
        await new Promise(resolve => setTimeout(resolve, transitionSpeed));


    }

    // Backtrack from goal to start to highlight the shortest path
    if (foundGoal) {
        let current = maze[goalRow][goalCol];
        while (current !== null) {
            current.classList.add("path");
            current = visited.get(current);
            await new Promise(resolve => setTimeout(resolve, transitionSpeed));
        }
    }
}

async function dfs(row, col, goalRow, goalCol) {
    if (row < 0 || col < 0 || row >= ROWS || col >= COLS || maze[row][col].classList.contains("visited") || maze[row][col].classList.contains("wall")) {
        return false;
    }

    if (row === goalRow && col === goalCol) { // Check if goal is reached
        maze[row][col].classList.add("path");
        return true;
    }

    maze[row][col].classList.add("visited");
    await new Promise(resolve => setTimeout(resolve, transitionSpeed));

    // DFS on all four directions
    if (await dfs(row + 1, col, goalRow, goalCol) || await dfs(row , col + 1, goalRow, goalCol) ||
        await dfs(row, col - 1, goalRow, goalCol) || await dfs(row - 1, col, goalRow, goalCol)) {
        maze[row][col].classList.add("path");
        await new Promise(resolve => setTimeout(resolve, transitionSpeed));
        return true;
    }

    return false;
}


// Dijkstra's Algorithm
async function dijkstra(startRow, startCol, goalRow, goalCol) {
    let distances = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
    let previous = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    let queue = [{ row: startRow, col: startCol, dist: 0 }];

    distances[startRow][startCol] = 0;

    while (queue.length > 0) {
        // Sort by shortest distance
        queue.sort((a, b) => a.dist - b.dist);
        let { row, col, dist } = queue.shift();

        if (row === goalRow && col === goalCol) {
            break; // Goal reached
        }

        // Neighbors: Right, Down, Left, Up
        let neighbors = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        for (let [dr, dc] of neighbors) {
            let newRow = row + dr, newCol = col + dc;

            if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && !maze[newRow][newCol].classList.contains("wall")) {
                let newDist = dist + 1; // All edges have weight 1
                if (newDist < distances[newRow][newCol]) {
                    distances[newRow][newCol] = newDist;
                    previous[newRow][newCol] = { row, col };
                    queue.push({ row: newRow, col: newCol, dist: newDist });
                }
            }
        }

        maze[row][col].classList.add("visited");
        await new Promise(resolve => setTimeout(resolve, transitionSpeed));
    }

    // Backtrack to find the path
    let current = { row: goalRow, col: goalCol };
    while (current && (current.row !== startRow || current.col !== startCol)) {
        let cell = maze[current.row][current.col];
        cell.classList.add("path");
        current = previous[current.row][current.col];
        await new Promise(resolve => setTimeout(resolve, transitionSpeed));
    }

    maze[startRow][startCol].classList.add("path");
    await new Promise(resolve => setTimeout(resolve, transitionSpeed));
}

async function aStar(startRow, startCol, goalRow, goalCol) {
    let openSet = [{ row: startRow, col: startCol, f: 0, g: 0, h: 0 }];
    let cameFrom = new Map();
    let gScore = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
    let fScore = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));

    gScore[startRow][startCol] = 0;
    fScore[startRow][startCol] = heuristic(startRow, startCol, goalRow, goalCol);

    while (openSet.length > 0) {
        // Get the node in openSet having the lowest fScore[] value
        openSet.sort((a, b) => a.f - b.f);
        let current = openSet.shift();

        if (current.row === goalRow && current.col === goalCol) {
            // Reconstruct path
            await pathAStar(cameFrom, current);
            return;
        }

        // Neighbors: Right, Down, Left, Up
        let neighbors = [[1, 0], [0, 1], [-1, 0], [0, -1]];
        for (let [dr, dc] of neighbors) {
            let neighborRow = current.row + dr, neighborCol = current.col + dc;

            if (neighborRow < 0 || neighborRow >= ROWS || neighborCol < 0 || neighborCol >= COLS || maze[neighborRow][neighborCol].classList.contains("wall")) {
                continue;
            }

            let tentativeGScore = gScore[current.row][current.col] + 1; // Assuming cost of 1 for each move
            if (tentativeGScore < gScore[neighborRow][neighborCol]) {
                cameFrom.set(neighborRow * COLS + neighborCol, current);
                gScore[neighborRow][neighborCol] = tentativeGScore;
                fScore[neighborRow][neighborCol] = tentativeGScore + heuristic(neighborRow, neighborCol, goalRow, goalCol);

                if (!openSet.some(node => node.row === neighborRow && node.col === neighborCol)) {
                    openSet.push({ row: neighborRow, col: neighborCol, f: fScore[neighborRow][neighborCol], g: tentativeGScore, h: heuristic(neighborRow, neighborCol, goalRow, goalCol) });
                }
            }
        }

        maze[current.row][current.col].classList.add("visited");
        await new Promise(resolve => setTimeout(resolve, transitionSpeed));
    }
}

function heuristic(row, col, goalRow, goalCol) {
    // Manhattan distance
    return Math.abs(row - goalRow) + Math.abs(col - goalCol);
}

async function pathAStar(cameFrom, current) {
    while (current !== undefined) {
        let cell = maze[current.row][current.col];
        cell.classList.add("path");
        current = cameFrom.get(current.row * COLS + current.col);
        await new Promise(resolve => setTimeout(resolve, transitionSpeed));
    }
}
function disableButtons() {
    algList = ["BFS", "DFS","Dijkstra","A*"]
    let undoAlgList = algList.filter(item => item !== curAlgorithm);

    document.querySelectorAll(".button-36").forEach(button => {
        if(undoAlgList.some(item => button.textContent.includes(item)))
            button.disabled = true;
    });
}
function enableButtons() {
    curAlgorithm = "";
    document.querySelectorAll(".button-36").forEach(button => {
        button.disabled = false;
    });
}
// Start A* from top-left corner to bottom-right corner

async function startAStar() {
    curAlgorithm = "A*";
    disableButtons();
    await aStar(0, 0, ROWS - 1, COLS - 1); // Assuming bottom-right is the goal
    enableButtons();
}


// Start Dijkstra's from top-left corner to bottom-right corner
async function startDijkstra() {
    curAlgorithm = "Dijkstra";
    disableButtons();
    await dijkstra(0, 0, ROWS - 1, COLS - 1); // Assuming bottom-right is the goal
    enableButtons();
}


async function startDFS() {
    curAlgorithm = "DFS";
    disableButtons();
    await dfs(0, 0, ROWS - 1, COLS - 1); // Start at top-left, goal at bottom-right
    enableButtons();
}


async function startBFS() {
    curAlgorithm = "BFS";
    disableButtons();
    await bfs(0, 0, ROWS - 1,COLS - 1); // Assuming top-left is the start point
    enableButtons();
}

// Initialize
window.onload = generateMaze;
