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


// =========================
// ASK AI
// =========================

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


// =========================
// MAKE NOTES
// =========================

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
                    question: `Create clear, student-friendly study notes on:

${question}

Include:
- Short definition
- Important points
- Key concepts
- Examples where useful
- Important terms
- Short summary

Organize the notes clearly using headings and bullet points.
Keep them useful for a college student and easy to revise.`
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


// =========================
// HANDWRITTEN NOTES
// =========================

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
                    question: `Create study notes for:

${question}

Make the content suitable for handwritten-style study pages.

Include:
1. Simple definition
2. Important concepts
3. Key points
4. Examples where useful
5. Important formulas or syntax if applicable
6. Short revision summary

Use clear headings and concise points.
Do not repeat the same information unnecessarily.
Make the content suitable for a college student.`
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            answer.innerText = "Error: " + data.error;
            return;
        }

        const pageStyleElement =
            document.getElementById("pageStyle");

        const noteFontElement =
            document.getElementById("noteFont");

        const pagesElement =
            document.getElementById("notePages");

        const pageStyle =
            pageStyleElement
                ? pageStyleElement.value
                : "plain";

        const noteFont =
            noteFontElement
                ? noteFontElement.value
                : "default";

        const pagesChoice =
            pagesElement
                ? pagesElement.value
                : "auto";


        // Determine number of pages
        let pageCount = 1;

        if (pagesChoice === "custom") {

            const customPages =
                document.getElementById("customPages");

            pageCount =
                customPages
                    ? parseInt(customPages.value) || 1
                    : 1;

        } else if (
            pagesChoice &&
            pagesChoice !== "auto"
        ) {

            pageCount = parseInt(pagesChoice) || 1;
        }


        // Format AI content
        const content =
            formatAnswer(data.answer);


        // Create pages
        let pagesHTML = "";

        for (let i = 0; i < pageCount; i++) {

            pagesHTML += `
                <div class="handwritten-note ${pageStyle} font-${noteFont}">
                    ${content}
                </div>
            `;

        }

        answer.innerHTML = pagesHTML;

    } catch (error) {

        answer.innerText =
            "Unable to create handwritten notes. Please try again.";

        console.error(error);
    }
}


// =========================
// CUSTOM PAGE CONTROL
// =========================

document.addEventListener("DOMContentLoaded", function () {

    const notePages =
        document.getElementById("notePages");

    const customPages =
        document.getElementById("customPages");

    if (notePages && customPages) {

        notePages.addEventListener("change", function () {

            if (this.value === "custom") {

                customPages.style.display =
                    "inline-block";

            } else {

                customPages.style.display =
                    "none";

            }

        });

    }

});
