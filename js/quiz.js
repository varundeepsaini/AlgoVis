document.getElementById('quizForm').addEventListener('submit', function(event) {
    event.preventDefault();

    let score = 0;
    const answers = {
        q1: "Dijkstra",
        q2: "None",
        q3: "O(n log n)",
        q4: "Nearly sorted small datasets",
        q5: "DFS can be used to detect cycles in a graph"
    };

    Object.keys(answers).forEach(question => {
        const selected = document.querySelector(`input[name="${question}"]:checked`);
        console.log(selected);
        if (selected && selected.value === answers[question]) {
            score++;
        }
    });

    document.getElementById('result').textContent = `You scored ${score} out of 5`;
});
