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
        "✍️ Planning and creating your handwritten notes...";

    try {
        const pageStyle = document.getElementById("pageStyle").value;
        const noteFont = document.getElementById("noteFont").value;
        const pagesChoice = document.getElementById("notePages").value;

        let pageInstruction = "";

        if (pagesChoice === "auto") {
            pageInstruction = `
Decide the appropriate number of pages yourself.
The number of pages must depend on how much content is
reasonably required to explain the topic properly.
Do not make the notes unnecessarily short.
`;
        } else if (pagesChoice === "custom") {
            const customPages =
                parseInt(document.getElementById("customPages").value) || 1;

            pageInstruction = `
Create approximately ${customPages} pages of notes.
Distribute the topic properly across these pages.
Do not repeat the same content just to fill pages.
`;
        } else {
            pageInstruction = `
Create approximately ${parseInt(pagesChoice)} pages of notes.
Distribute the topic properly across these pages.
Do not repeat the same content just to fill pages.
`;
        }

        const prompt = `
Create detailed handwritten-style study notes for a college student on:

"${question}"

${pageInstruction}

IMPORTANT:

1. First understand the complete topic.
2. Divide the topic logically into sections.
3. Each page must contain DIFFERENT content.
4. Do not repeat content between pages.
5. Start from basic concepts and gradually move to advanced concepts.
6. Include definitions, explanations, important points and examples.
7. Include programs/code where appropriate.
8. Include formulas where appropriate.
9. Include important exam points where useful.
10. End with a short revision/summary section.

FORMAT THE RESPONSE EXACTLY LIKE THIS:

PAGE 1
[Page 1 title]

[Page 1 content]

PAGE 2
[Page 2 title]

[Page 2 content]

PAGE 3
[Page 3 title]

[Page 3 content]

Continue until the entire topic has been properly covered.

Do NOT write anything before PAGE 1.
Do NOT use HTML.
`;

        const response = await fetch(
            "https://ai-study-assistant.anshikasaxena50.workers.dev",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: prompt
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            answer.innerText = "Error: " + data.error;
            return;
        }

        const text = data.answer;

        // Split AI response into individual pages
        const rawPages = text
            .split(/PAGE\s+\d+/i)
            .map(page => page.trim())
            .filter(page => page.length > 0);

        let pagesHTML = "";

        rawPages.forEach((page, index) => {

            const formattedPage = formatAnswer(page);

            pagesHTML += `
                <div class="handwritten-note ${pageStyle} font-${noteFont}">
                    <div class="page-number">
                        Page ${index + 1}
                    </div>

                    ${formattedPage}
                </div>
            `;
        });

        answer.innerHTML = pagesHTML;

    } catch (error) {

        answer.innerText =
            "Unable to create handwritten notes. Please try again.";

        console.error(error);
    }
}
