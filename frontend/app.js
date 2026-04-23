const API = "http://localhost:5000";
let optionCount = 2;

function addOption() {
    if (optionCount >= 4) return;
    optionCount++;
    renderOptions();
}

function renderOptions() {
    const div = document.getElementById("options");
    div.innerHTML = "";

    for (let i = 0; i < optionCount; i++) {
        div.innerHTML += `<input id="opt${i}" placeholder="Option ${i + 1}">`;
    }
}
renderOptions();

/* CREATE */
async function createPoll() {
    const question = document.getElementById("question").value;

    const options = [];
    for (let i = 0; i < optionCount; i++) {
        const val = document.getElementById(`opt${i}`).value;
        if (val) options.push(val);
    }

    if (!question || options.length < 2) {
        alert("Enter valid question and options");
        return;
    }

    await fetch(`${API}/polls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options })
    });

    document.getElementById("question").value = "";
    optionCount = 2;
    renderOptions();

    loadPolls();
}

/* LOAD */
async function loadPolls() {
    const res = await fetch(`${API}/polls`);
    const polls = await res.json();

    const container = document.getElementById("polls");
    container.innerHTML = "";

    polls.forEach(poll => {
        const div = document.createElement("div");
        div.className = "poll";

        const total = poll.options.reduce((s, o) => s + o.votes, 0);
        const maxVotes = Math.max(...poll.options.map(o => o.votes));

        div.innerHTML = `<h3>${poll.question}</h3>`;

        poll.options.forEach((opt, i) => {
            const percent = total ? Math.round((opt.votes / total) * 100) : 0;
            const isWinner = opt.votes === maxVotes && maxVotes > 0;

            if (!localStorage.getItem(`voted_${poll.id}`)) {
                div.innerHTML += `
          <button onclick="vote('${poll.id}', ${i})">${opt.text}</button>
        `;
            } else {
                div.innerHTML += `
          <div class="${isWinner ? 'winner' : ''}">
            ${opt.text} (${opt.votes})
          </div>
          <div class="bar" style="width:${percent}%">${percent}%</div>
        `;
            }
        });

        div.innerHTML += `<p>Total Votes: ${total}</p>`;

        div.innerHTML += `
      <button class="delete" onclick="deletePoll('${poll.id}')">Delete</button>
    `;

        container.appendChild(div);
    });
}

/* VOTE */
async function vote(id, index) {
    if (localStorage.getItem(`voted_${id}`)) {
        alert("Already voted!");
        return;
    }

    await fetch(`${API}/polls/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex: index })
    });

    localStorage.setItem(`voted_${id}`, "true");
    loadPolls();
}

/* DELETE */
async function deletePoll(id) {
    await fetch(`${API}/polls/${id}`, { method: "DELETE" });
    loadPolls();
}

loadPolls();