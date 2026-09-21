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
    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer");

    if (!question) {
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
                    question:
                        "Create clear, well-organized study notes on: " +
                        question +
                        "\n\n" +
                        "Include definition, important points, key concepts, examples, " +
                        "and a short revision summary. Use headings and bullet points. " +
                        "Make the notes suitable for a college student and easy to revise."
                })
            }
        );

        const data = await response.json();

        console.log("Notes response:", data);

        if (!response.ok) {
            answer.innerText =
                "Error: " +
                (data.error || "Unable to create notes.");
            return;
        }

        if (!data.answer) {
            answer.innerText =
                "The AI did not return any notes.";
            return;
        }

        answer.innerHTML = formatAnswer(data.answer);

    } catch (error) {

        console.error("Notes error:", error);

        answer.innerText =
            "Unable to create notes. Please try again.";
    }
}
async function handwrittenNotes() {
    const question = document.getElementById("question").value.trim();
    const answer = document.getElementById("answer");

    if (!question) {
        answer.innerText =
            "Please enter a topic for handwritten notes.";
        return;
    }

    answer.innerText =
        "✍️ Creating your handwritten notes...";

    try {
        // Get user's settings
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


        // =========================================
        // ASK AI FOR DETAILED STUDY CONTENT
        // =========================================

        const response = await fetch(
            "https://ai-study-assistant.anshikasaxena50.workers.dev",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    question:
                        `Create handwritten-style study notes for:

${question}

Make the notes detailed enough to cover the topic properly.

Organize the content in this order when relevant:

1. Introduction
2. Simple definition
3. Important concepts
4. Key points
5. Syntax / formulas / algorithms
6. Examples
7. Advantages and disadvantages
8. Applications
9. Important exam points
10. Short revision summary

Use clear headings and concise points.

IMPORTANT:
- Do not repeat the same information.
- Cover the topic from basic to advanced level.
- Write enough useful content for multiple handwritten study pages when the topic is large.
- Keep the content suitable for a college student.
- Make it easy to revise for exams.`
                })
            }
        );


        const data = await response.json();


        // =========================================
        // ERROR HANDLING
        // =========================================

        if (!response.ok || data.error) {
            answer.innerText =
                "Error: " +
                (data.error || "Unable to create handwritten notes.");
            return;
        }

        if (!data.answer) {
            answer.innerText =
                "The AI did not return any notes.";
            return;
        }


        // =========================================
        // DETERMINE PAGE COUNT
        // =========================================

        let pageCount;


        // AUTO PAGE COUNT
        if (pagesChoice === "auto") {

            const textLength =
                data.answer.length;

            if (textLength <= 1800) {
                pageCount = 1;
            }
            else if (textLength <= 3500) {
                pageCount = 2;
            }
            else if (textLength <= 5500) {
                pageCount = 3;
            }
            else if (textLength <= 7500) {
                pageCount = 4;
            }
            else if (textLength <= 9500) {
                pageCount = 5;
            }
            else if (textLength <= 12000) {
                pageCount = 6;
            }
            else if (textLength <= 15000) {
                pageCount = 8;
            }
            else {
                pageCount = 10;
            }

        }

        // CUSTOM PAGE COUNT
        else if (pagesChoice === "custom") {

            const customPages =
                document.getElementById("customPages");

            pageCount =
                customPages
                    ? parseInt(customPages.value)
                    : 1;

            if (!pageCount || pageCount < 1) {
                pageCount = 1;
            }

            if (pageCount > 20) {
                pageCount = 20;
            }

        }

        // FIXED PAGE COUNT
        else {

            pageCount =
                parseInt(pagesChoice) || 1;
        }


        // =========================================
        // SPLIT CONTENT INTO DIFFERENT PAGES
        // =========================================

        const rawText =
            data.answer.trim();

        // Split mainly by paragraphs
        let sections =
            rawText
                .split(/\n\s*\n/)
                .map(section => section.trim())
                .filter(section => section.length > 0);


        // If AI didn't create enough paragraphs,
        // split large sections by lines.
        if (sections.length < pageCount) {

            sections =
                rawText
                    .split(/\n/)
                    .map(section => section.trim())
                    .filter(section => section.length > 0);
        }


        // =========================================
        // CREATE PAGE CONTENT
        // =========================================

        const pages = [];

        const itemsPerPage =
            Math.ceil(sections.length / pageCount);


        for (let i = 0; i < pageCount; i++) {

            const start =
                i * itemsPerPage;

            const end =
                start + itemsPerPage;

            let pageContent =
                sections.slice(start, end);


            // If there is no content for this page,
            // don't create an empty page.
            if (pageContent.length === 0) {
                continue;
            }


            pages.push(pageContent.join("\n\n"));
        }


        // =========================================
        // RENDER PAGES
        // =========================================

        let pagesHTML = "";


        pages.forEach((pageContent, index) => {

            const formattedContent =
                formatAnswer(pageContent);


            pagesHTML += `
                <div class="handwritten-note ${pageStyle} font-${noteFont}">

                    <div class="note-page-number">
                        Page ${index + 1}
                    </div>

                    <div class="note-content">
                        ${formattedContent}
                    </div>

                </div>
            `;

        });


        answer.innerHTML = pagesHTML;


    } catch (error) {

        console.error(
            "Handwritten Notes error:",
            error
        );

        answer.innerText =
            "Unable to create handwritten notes. Please try again.";
    }
}
