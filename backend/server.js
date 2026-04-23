const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

let db = { polls: [] };

// GET polls
app.get("/polls", (req, res) => {
    res.json(db.polls);
});

// CREATE poll
app.post("/polls", (req, res) => {
    const { question, options } = req.body;

    const poll = {
        id: uuidv4(),
        question,
        options: options.map(o => ({ text: o, votes: 0 })),
        voters: [],
        createdAt: new Date()
    };

    db.polls.push(poll);
    res.json(poll);
});

// VOTE
app.post("/polls/:id/vote", (req, res) => {
    const poll = db.polls.find(p => p.id === req.params.id);
    if (!poll) return res.status(404).send("Not found");

    const { optionIndex } = req.body;

    poll.options[optionIndex].votes++;
    poll.voters.push("user");

    res.json(poll);
});

// DELETE
app.delete("/polls/:id", (req, res) => {
    db.polls = db.polls.filter(p => p.id !== req.params.id);
    res.send("Deleted");
});

app.listen(5000, () => console.log("Server running on 5000"));