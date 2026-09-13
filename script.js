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
    const pageStyle = document.getElementById("pageStyle").value;
    const noteFont = document.getElementById("noteFont").value;
    const pagesChoice = document.getElementById("notePages").value;

    let pageCount;

    if (pagesChoice === "custom") {
        pageCount = parseInt(
            document.getElementById("customPages").value
        ) || 1;
    } else {
        pageCount = parseInt(pagesChoice);
    }

    const content = formatAnswer(data.answer);

    let pagesHTML = "";

    for (let i = 0; i < pageCount; i++) {
        pagesHTML += `
            <div class="handwritten-note ${pageStyle} font-${noteFont}">
                ${content}
            </div>
        `;
    }

    answer.innerHTML = pagesHTML;
}
    } catch (error) {
        answer.innerText =
            "Unable to create handwritten notes. Please try again.";

        console.error(error);
    }
}
const notePages = document.getElementById("notePages");

if (notePages) {
    notePages.addEventListener("change", function () {
        const customPages = document.getElementById("customPages");

        if (this.value === "custom") {
            customPages.style.display = "inline-block";
        } else {
            customPages.style.display = "none";
        }
    });
}
