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


// ==========================================
// HIDE ALL CONTROLS
// ==========================================

function hideAllControls() {

    const notesControls =
        document.getElementById("notesControls");

    const handwrittenControls =
        document.getElementById("handwrittenControls");

    const customNotesPages =
        document.getElementById("customNotesPages");

    const customHandwrittenPages =
        document.getElementById("customHandwrittenPages");

    if (notesControls) {
        notesControls.classList.add("hidden");
    }

    if (handwrittenControls) {
        handwrittenControls.classList.add("hidden");
    }

    if (customNotesPages) {
        customNotesPages.classList.add("hidden");
    }

    if (customHandwrittenPages) {
        customHandwrittenPages.classList.add("hidden");
    }
}


// ==========================================
// SHOW NOTES CONTROLS
// ==========================================

function showNotesControls() {

    hideAllControls();

    const notesControls =
        document.getElementById("notesControls");

    if (notesControls) {
        notesControls.classList.remove("hidden");
    }
}


// ==========================================
// SHOW HANDWRITTEN CONTROLS
// ==========================================

function showHandwrittenControls() {

    hideAllControls();

    const handwrittenControls =
        document.getElementById("handwrittenControls");

    if (handwrittenControls) {
        handwrittenControls.classList.remove("hidden");
    }
}


// ==========================================
// ASK AI
// ==========================================

async function askAI() {

    hideAllControls();

    const question =
        document.getElementById("question").value;

    const answer =
        document.getElementById("answer");

    if (question.trim() === "") {

        answer.innerText =
            "Please enter a question.";

        return;
    }

    answer.innerText =
        "Thinking...";

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

        const data =
            await response.json();

        if (data.error) {

            answer.innerText =
                "Error: " + data.error;

        } else {

            answer.innerHTML =
                formatAnswer(data.answer);
        }

    } catch (error) {

        console.error("Ask AI error:", error);

        answer.innerText =
            "Unable to connect to AI. Please try again.";
    }
}


// ==========================================
// MAKE NOTES
// ==========================================

async function makeNotes() {

    showNotesControls();

    const question =
        document.getElementById("question").value.trim();

    const answer =
        document.getElementById("answer");

    if (!question) {

        answer.innerText =
            "Please enter a topic for your notes.";

        return;
    }

    answer.innerText =
        "📝 Creating your notes...";

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

                        "Include:\n" +
                        "- Definition\n" +
                        "- Important points\n" +
                        "- Key concepts\n" +
                        "- Examples\n" +
                        "- Short revision summary\n\n" +

                        "Use headings and bullet points. " +
                        "Make the notes suitable for a college student " +
                        "and easy to revise."

                })
            }
        );

        const data =
            await response.json();

        console.log(
            "Notes response:",
            data
        );

        if (!response.ok) {

            answer.innerText =
                "Error: " +
                (data.error ||
                    "Unable to create notes.");

            return;
        }

        if (!data.answer) {

            answer.innerText =
                "The AI did not return any notes.";

            return;
        }

        answer.innerHTML =
            formatAnswer(data.answer);

    } catch (error) {

        console.error(
            "Notes error:",
            error
        );

        answer.innerText =
            "Unable to create notes. Please try again.";
    }
}


// ==========================================
// HANDWRITTEN NOTES
// ==========================================

async function handwrittenNotes() {

    showHandwrittenControls();

    const question =
        document.getElementById("question").value.trim();

    const answer =
        document.getElementById("answer");

    if (!question) {

        answer.innerText =
            "Please enter a topic for handwritten notes.";

        return;
    }


    // --------------------------------------
    // GET PAGE COUNT
    // --------------------------------------

    const pageSelect =
        document.getElementById(
            "handwrittenPageNumber"
        );

    const customPageInput =
        document.getElementById(
            "customHandwrittenPages"
        );

    let pageCount = 1;

    if (pageSelect) {

        if (pageSelect.value === "custom") {

            pageCount =
                parseInt(
                    customPageInput.value
                ) || 1;

        } else {

            pageCount =
                parseInt(
                    pageSelect.value
                ) || 1;
        }
    }


    // Maximum 10 pages
    pageCount =
        Math.max(
            1,
            Math.min(
                pageCount,
                10
            )
        );


    answer.innerHTML =
        "✍️ Creating handwritten notes...";


    try {

        // --------------------------------------
        // CREATE ALL NOTES IN ONE AI REQUEST
        // --------------------------------------

        const response = await fetch(
            "https://ai-study-assistant.anshikasaxena50.workers.dev",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    question:
                        `Create detailed handwritten-style study notes on:

${question}

The student wants ${pageCount} page(s).

Divide the notes naturally into ${pageCount} clearly separated page(s).

IMPORTANT RULES:

1. Stay completely focused on the topic.
2. Do not repeat the same information.
3. Each page should contain useful new information.
4. Use simple language suitable for a college student.
5. Include definitions, important points, examples, formulas, algorithms, applications or exam points when relevant.
6. Use headings and bullet points where useful.
7. Keep the content suitable for handwritten study notes.
8. Do not mention these instructions.
9. Clearly mark each page using:

PAGE 1
PAGE 2
PAGE 3

Continue only up to PAGE ${pageCount}.`

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok ||
            data.error) {

            answer.innerText =
                "Error: " +
                (
                    data.error ||
                    "StudySphere AI is temporarily unavailable. Please try again shortly."
                );

            return;
        }


        if (!data.answer) {

            answer.innerText =
                "The AI did not return any handwritten notes.";

            return;
        }


        // --------------------------------------
        // GET SELECTED STYLE
        // --------------------------------------

        const background =
            document.getElementById(
                "pageBackground"
            )?.value || "lined";


        const font =
            document.getElementById(
                "handwrittenFont"
            )?.value || "hand1";


        // --------------------------------------
        // SPLIT INTO PAGES
        // --------------------------------------

        const pageRegex =
            /PAGE\s*\d+\s*([\s\S]*?)(?=PAGE\s*\d+|$)/gi;

        const pages = [];

        let match;

        while (
            (match =
                pageRegex.exec(data.answer)) !== null
        ) {

            const content =
                match[1].trim();

            if (content) {
                pages.push(content);
            }
        }


        // If AI did not use PAGE headings,
        // display the complete response as one page.

        if (pages.length === 0) {

            pages.push(
                data.answer.trim()
            );
        }


        // --------------------------------------
        // CREATE NOTE PAGES
        // --------------------------------------

        let pagesHTML = "";


        pages.forEach(
            (content, index) => {

                pagesHTML += `

                    <div
                        class="handwritten-note
                        background-${background}
                        font-${font}"
                    >

                        <div class="note-page-number">
                            Page ${index + 1}
                        </div>

                        <div class="note-content">

                            ${formatAnswer(content)}

                        </div>

                    </div>

                `;
            }
        );


        answer.innerHTML =
            pagesHTML;


    } catch (error) {

        console.error(
            "Handwritten Notes error:",
            error
        );

        answer.innerText =
            "Unable to create handwritten notes. Please try again.";
    }
}


// ==========================================
// PAGE CONTROL EVENTS
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        hideAllControls();


        // -------------------------------
        // NOTES CUSTOM PAGE NUMBER
        // -------------------------------

        const notesPageNumber =
            document.getElementById(
                "notesPageNumber"
            );

        const customNotesPages =
            document.getElementById(
                "customNotesPages"
            );


        if (
            notesPageNumber &&
            customNotesPages
        ) {

            notesPageNumber.addEventListener(
                "change",
                function () {

                    if (
                        this.value === "custom"
                    ) {

                        customNotesPages
                            .classList
                            .remove("hidden");

                    } else {

                        customNotesPages
                            .classList
                            .add("hidden");
                    }
                }
            );
        }


        // -------------------------------
        // HANDWRITTEN CUSTOM PAGE NUMBER
        // -------------------------------

        const handwrittenPageNumber =
            document.getElementById(
                "handwrittenPageNumber"
            );

        const customHandwrittenPages =
            document.getElementById(
                "customHandwrittenPages"
            );


        if (
            handwrittenPageNumber &&
            customHandwrittenPages
        ) {

            handwrittenPageNumber.addEventListener(
                "change",
                function () {

                    if (
                        this.value === "custom"
                    ) {

                        customHandwrittenPages
                            .classList
                            .remove("hidden");

                    } else {

                        customHandwrittenPages
                            .classList
                            .add("hidden");
                    }
                }
            );
        }

    }
);
```
