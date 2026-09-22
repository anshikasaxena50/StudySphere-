// ==========================================
// STUDYSPHERE - ANSWER FORMATTER
// ==========================================

function formatAnswer(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")

        .replace(
            /```mermaid\s*([\s\S]*?)```/gi,
            function(match, diagram) {

                return `
                    <div class="note-diagram">
                        <div class="mermaid">
                            ${diagram.trim()}
                        </div>
                    </div>
                `;
            }
        )

        .replace(
            /\*\*\*(.*?)\*\*\*/g,
            "<strong><em>$1</em></strong>"
        )

        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        )

        .replace(
            /\*(.*?)\*/g,
            "<em>$1</em>"
        )

        .replace(
            /^### (.*)$/gm,
            "<h3>$1</h3>"
        )

        .replace(
            /^## (.*)$/gm,
            "<h2>$1</h2>"
        )

        .replace(
            /^# (.*)$/gm,
            "<h1>$1</h1>"
        )

        .replace(
            /^---$/gm,
            "<hr>"
        )

        .replace(
            /^\d+\.\s+(.*)$/gm,
            "<div class='list-item'>• $1</div>"
        )

        .replace(
            /^\*\s+(.*)$/gm,
            "<div class='list-item'>• $1</div>"
        )

        .replace(
            /\n\n/g,
            "<br><br>"
        )

        .replace(
            /\n/g,
            "<br>"
        );
}


// ==========================================
// INITIALIZE MERMAID
// ==========================================

if (typeof mermaid !== "undefined") {

    mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose"
    });

}


// ==========================================
// RENDER DIAGRAMS
// ==========================================

async function renderDiagrams() {

    if (
        typeof mermaid === "undefined"
    ) {
        return;
    }

    const diagrams =
        document.querySelectorAll(
            ".mermaid"
        );

    if (!diagrams.length) {
        return;
    }

    try {

        await mermaid.run({
            nodes: diagrams
        });

    } catch (error) {

        console.error(
            "Diagram rendering error:",
            error
        );

    }
}


// ==========================================
// HIDE ALL CONTROLS
// ==========================================

function hideAllControls() {

    const notesControls =
        document.getElementById(
            "notesControls"
        );

    const handwrittenControls =
        document.getElementById(
            "handwrittenControls"
        );

    const customNotesPages =
        document.getElementById(
            "customNotesPages"
        );

    const customHandwrittenPages =
        document.getElementById(
            "customHandwrittenPages"
        );


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
        document.getElementById(
            "notesControls"
        );

    if (notesControls) {
        notesControls.classList.remove(
            "hidden"
        );
    }
}


// ==========================================
// SHOW HANDWRITTEN CONTROLS
// ==========================================

function showHandwrittenControls() {

    hideAllControls();

    const handwrittenControls =
        document.getElementById(
            "handwrittenControls"
        );

    if (handwrittenControls) {
        handwrittenControls.classList.remove(
            "hidden"
        );
    }
}


// ==========================================
// GET PAGE COUNT
// ==========================================

function getPageCount(
    selectId,
    customInputId
) {

    const pageSelect =
        document.getElementById(
            selectId
        );

    const customPageInput =
        document.getElementById(
            customInputId
        );


    let pageCount = 1;


    if (pageSelect) {

        if (
            pageSelect.value === "custom"
        ) {

            pageCount =
                parseInt(
                    customPageInput?.value
                ) || 1;

        } else {

            pageCount =
                parseInt(
                    pageSelect.value
                ) || 1;
        }
    }


    pageCount =
        Math.max(
            1,
            Math.min(
                pageCount,
                10
            )
        );


    return pageCount;
}


// ==========================================
// SPLIT AI RESPONSE INTO PAGES
// ==========================================

function splitPages(text) {

    const pageRegex =
        /PAGE\s*\d+\s*([\s\S]*?)(?=PAGE\s*\d+|$)/gi;


    const pages = [];

    let match;


    while (
        (match =
            pageRegex.exec(text)) !== null
    ) {

        const content =
            match[1].trim();

        if (content) {
            pages.push(content);
        }
    }


    if (pages.length === 0) {

        pages.push(
            text.trim()
        );
    }


    return pages;
}


// ==========================================
// ADD PDF BUTTON
// ==========================================

function addPDFButton(
    type,
    filename
) {

    const answer =
        document.getElementById(
            "answer"
        );


    const oldButton =
        document.querySelector(
            ".pdf-button-container"
        );


    if (oldButton) {
        oldButton.remove();
    }


    const container =
        document.createElement(
            "div"
        );


    container.className =
        "pdf-button-container";


    const button =
        document.createElement(
            "button"
        );


    button.className =
        "pdf-button";


    button.innerText =
        "📄 Download PDF";


    button.onclick =
        function () {

            downloadPDF(
                type,
                filename
            );

        };


    container.appendChild(
        button
    );


    answer.insertAdjacentElement(
        "afterend",
        container
    );
}


// ==========================================
// DOWNLOAD PDF
// ==========================================

async function downloadPDF(
    type,
    filename
) {

    if (
        typeof html2pdf ===
        "undefined"
    ) {

        alert(
            "PDF generator is not available. Please refresh the page and try again."
        );

        return;
    }


    const answer =
        document.getElementById(
            "answer"
        );


    if (!answer) {
        return;
    }


    const button =
        document.querySelector(
            ".pdf-button"
        );


    if (button) {

        button.innerText =
            "⏳ Creating PDF...";

        button.disabled = true;
    }


    try {

        const options = {

            margin: 10,

            filename:
                filename,

            image: {
                type: "jpeg",
                quality: 0.98
            },

            html2canvas: {
                scale: 2,

                useCORS: true,

                logging: false
            },

            jsPDF: {
                unit: "mm",

                format: "a4",

                orientation:
                    "portrait"
            },

            pagebreak: {
                mode: [
                    "css",
                    "legacy"
                ]
            }

        };


        await html2pdf()
            .set(options)
            .from(answer)
            .save();


    } catch (error) {

        console.error(
            "PDF error:",
            error
        );

        alert(
            "Unable to create PDF. Please try again."
        );

    } finally {

        if (button) {

            button.innerText =
                "📄 Download PDF";

            button.disabled =
                false;
        }
    }
}


// ==========================================
// ASK AI
// ==========================================

async function askAI() {

    hideAllControls();


    const question =
        document
            .getElementById(
                "question"
            )
            .value;


    const answer =
        document.getElementById(
            "answer"
        );


    const oldButton =
        document.querySelector(
            ".pdf-button-container"
        );


    if (oldButton) {
        oldButton.remove();
    }


    if (
        question.trim() === ""
    ) {

        answer.innerText =
            "Please enter a question.";

        return;
    }


    answer.innerText =
        "Thinking...";


    try {

        const response =
            await fetch(
                "https://ai-study-assistant.anshikasaxena50.workers.dev",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        question:
                            question
                    })
                }
            );


        const data =
            await response.json();


        if (data.error) {

            answer.innerText =
                "Error: " +
                data.error;

        } else {

            answer.innerHTML =
                formatAnswer(
                    data.answer
                );

            await renderDiagrams();
        }


    } catch (error) {

        console.error(
            "Ask AI error:",
            error
        );


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
        document
            .getElementById(
                "question"
            )
            .value
            .trim();


    const answer =
        document.getElementById(
            "answer"
        );


    const oldButton =
        document.querySelector(
            ".pdf-button-container"
        );


    if (oldButton) {
        oldButton.remove();
    }


    if (!question) {

        answer.innerText =
            "Please enter a topic for your notes.";

        return;
    }


    const pageCount =
        getPageCount(
            "notesPageNumber",
            "customNotesPages"
        );


    const diagramChoice =
        document.getElementById(
            "notesDiagram"
        )?.value || "no";


    answer.innerText =
        "📝 Creating your notes...";


    let diagramInstruction =
        "";


    if (
        diagramChoice === "yes"
    ) {

        diagramInstruction = `

Also include ONE useful diagram when the topic supports it.

Create the diagram using Mermaid syntax.

Use this exact format:

\`\`\`mermaid
flowchart TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

Only include a diagram that is relevant to the topic.
`;
    }


    try {

        const response =
            await fetch(
                "https://ai-study-assistant.anshikasaxena50.workers.dev",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        question:

`Create clear, well-organized study notes on:

${question}

The student wants ${pageCount} page(s).

Divide the notes naturally into exactly ${pageCount} clearly separated page(s).

Use this format:

PAGE 1
content

PAGE 2
content

Continue only up to PAGE ${pageCount}.

Rules:
- Stay completely focused on the topic.
- Do not repeat information.
- Each page should contain useful new information.
- Use simple language suitable for a college student.
- Include definitions, important points, key concepts, examples, formulas, algorithms, applications or exam points when relevant.
- Use headings and bullet points where useful.
- Make the notes easy to revise.
- Do not mention these instructions.
${diagramInstruction}`
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.error
        ) {

            answer.innerText =
                "Error: " +
                (
                    data.error ||
                    "Unable to create notes."
                );

            return;
        }


        if (!data.answer) {

            answer.innerText =
                "The AI did not return any notes.";

            return;
        }


        const pages =
            splitPages(
                data.answer
            );


        let pagesHTML = "";


        pages.forEach(
            (content, index) => {

                pagesHTML += `

                    <div class="normal-note-page pdf-page">

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


        await renderDiagrams();


        addPDFButton(
            "notes",
            "StudySphere-Notes.pdf"
        );


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
        document
            .getElementById(
                "question"
            )
            .value
            .trim();


    const answer =
        document.getElementById(
            "answer"
        );


    const oldButton =
        document.querySelector(
            ".pdf-button-container"
        );


    if (oldButton) {
        oldButton.remove();
    }


    if (!question) {

        answer.innerText =
            "Please enter a topic for handwritten notes.";

        return;
    }


    const pageCount =
        getPageCount(
            "handwrittenPageNumber",
            "customHandwrittenPages"
        );


    const background =
        document
            .getElementById(
                "pageBackground"
            )
            ?.value ||
        "lined";


    const font =
        document
            .getElementById(
                "handwrittenFont"
            )
            ?.value ||
        "caveat";


    const diagramChoice =
        document.getElementById(
            "handwrittenDiagram"
        )?.value || "no";


    answer.innerHTML =
        "✍️ Creating handwritten notes...";


    let diagramInstruction =
        "";


    if (
        diagramChoice === "yes"
    ) {

        diagramInstruction = `

Also include ONE useful diagram when the topic supports it.

Create the diagram using Mermaid syntax.

Use this exact format:

\`\`\`mermaid
flowchart TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

Only include a diagram that is relevant to the topic.
`;
    }


    try {

        const response =
            await fetch(
                "https://ai-study-assistant.anshikasaxena50.workers.dev",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        question:

`Create detailed handwritten-style study notes on:

${question}

The student wants ${pageCount} page(s).

Divide the notes naturally into exactly ${pageCount} clearly separated page(s).

Use this format:

PAGE 1
content

PAGE 2
content

Continue only up to PAGE ${pageCount}.

Rules:
1. Stay completely focused on the topic.
2. Do not repeat the same information.
3. Each page should contain useful new information.
4. Use simple language suitable for a college student.
5. Include definitions, important points, examples, formulas, algorithms, applications or exam points when relevant.
6. Use headings and bullet points where useful.
7. Keep the content suitable for handwritten study notes.
8. Do not mention these instructions.
${diagramInstruction}`
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.error
        ) {

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


        const pages =
            splitPages(
                data.answer
            );


        let pagesHTML = "";


        pages.forEach(
            (content, index) => {

                pagesHTML += `

                    <div
                        class="handwritten-note
                        pdf-page
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


        await renderDiagrams();


        addPDFButton(
            "handwritten",
            "StudySphere-Handwritten-Notes.pdf"
        );


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


        // ==================================
        // NOTES CUSTOM PAGE NUMBER
        // ==================================

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


        // ==================================
        // HANDWRITTEN CUSTOM PAGE NUMBER
        // ==================================

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
