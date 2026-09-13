function formatAnswer(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/^### (.*)$/gm, "<h3>$1</h3>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>")
        .replace(/^# (.*)$/gm, "<h1>$1</h1>")
        .replace(/^---$/gm, "<hr>")
        .replace(/^\d+\.\s+(.*)$/gm, "<div class='list-item'>• $1</div>")
        .replace(/^\*\s+(.*)$/gm, "<div class='list-item'>• $1</div>")
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>");
}


async function askAI() {
    const question = document.getElementById("question").value;
    const answer = document.getElementById("answer");

    if (question.trim() === "") {
        answer.innerText = "Please enter a question.";
        return;
    }

    answer.innerText = "Thinking...";

    try {
        const response = await fetch(
            "https://ai-study-assistant.anshikasaxena50.workers.dev",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: question
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            answer.innerText = "Error: " + data.error;
        } else {
            answer.innerHTML = formatAnswer(data.answer);
        }

    } catch (error) {
        answer.innerText =
            "Unable to connect to AI. Please try again.";

        console.error(error);
    }
}


async function makeNotes() {
    const question = document.getElementById("question").value;
    const answer = document.getElementById("answer");

    if (question.trim() === "") {
        answer.innerText = "Please enter a topic for your notes.";
        return;
    }

    answer.innerText = "📝 Creating your notes...";

    try {
        const response = await fetch(
            "https://ai-study-assistant.anshikasaxena50.workers.dev",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: `Create clear, student-friendly study notes on this topic: ${question}

Use:
- A short definition
- Important points
- Key concepts
- Examples where useful
- A short summary at the end

Keep the notes well organized and easy to revise.`
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            answer.innerText = "Error: " + data.error;
        } else {
            answer.innerHTML = formatAnswer(data.answer);
        }

    } catch (error) {
        answer.innerText =
            "Unable to create notes. Please try again.";

        console.error(error);
    }
}


async function handwrittenNotes() {
    const question = document.getElementById("question").value;
    const answer = document.getElementById("answer");

    if (question.trim() === "") {
        answer.innerText =
            "Please enter a topic for handwritten notes.";
        return;
    }

    answer.innerText =
        "✍️ Creating your handwritten notes...";

    try {
        const response = await fetch(
            "https://ai-study-assistant.anshikasaxena50.workers.dev",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: `Create clear and short study notes on: ${question}

Include:
1. Simple definition
2. Important points
3. Key concepts
4. Examples if useful
5. Short summary

Keep the notes easy for a college student to revise.`
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            answer.innerText = "Error: " + data.error;
        } else {
            answer.innerHTML = `
                <div class="handwritten-note">
                    ${formatAnswer(data.answer)}
                </div>
            `;
        }

    } catch (error) {
        answer.innerText =
            "Unable to create handwritten notes. Please try again.";

        console.error(error);
    }
}
/* Handwritten note customization controls */
.note-options {
    width: 90%;
    max-width: 700px;
    margin: 20px auto;
    padding: 15px;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
}

.note-options label {
    font-size: 14px;
    color: #333;
    font-weight: bold;
}

.note-options select,
.note-options input {
    width: auto;
    max-width: none;
    padding: 8px 10px;
    margin: 0;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
}

#customPages {
    width: 80px;
}

/* Different handwritten page backgrounds */

.handwritten-note.plain {
    background: #ffffff;
}

.handwritten-note.cream {
    background: #fff8df;
}

.handwritten-note.blue {
    background: #eef7ff;
}

.handwritten-note.green {
    background: #effbea;
}

.handwritten-note.grid {
    background-color: #fffdf3;
    background-image:
        linear-gradient(#c9dceb 1px, transparent 1px),
        linear-gradient(90deg, #c9dceb 1px, transparent 1px);
    background-size: 25px 25px;
}

.handwritten-note.dotted {
    background-color: #fffdf3;
    background-image: radial-gradient(#a9c7df 1px, transparent 1px);
    background-size: 18px 18px;
}

/* Different handwriting fonts */

.handwritten-note.font-comic {
    font-family: "Comic Sans MS", cursive;
}

.handwritten-note.font-segoe {
    font-family: "Segoe Print", "Bradley Hand", cursive;
}

.handwritten-note.font-caveat {
    font-family: "Caveat", "Comic Sans MS", cursive;
}

.handwritten-note.font-serif {
    font-family: Georgia, "Times New Roman", serif;
}

/* Diagram / figure area */

.diagram-container {
    width: 90%;
    max-width: 800px;
    margin: 25px auto;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
    text-align: center;
}

.diagram-container img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

.diagram-title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
}
