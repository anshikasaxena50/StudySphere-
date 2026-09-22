function formatAnswer(text) {

    if (!text) {
        return "";
    }

    // Save Mermaid diagrams before formatting text
    const diagrams = [];

    text = text.replace(
        /```mermaid\s*([\s\S]*?)```/gi,
        function (match, diagram) {

            const id =
                "diagram-" +
                diagrams.length;

            diagrams.push(
                diagram.trim()
            );

            return `___MERMAID_${id}___`;
        }
    );


    // Escape HTML
    text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");


    // Bold + italic
    text = text.replace(
        /\*\*\*(.*?)\*\*\*/g,
        "<strong><em>$1</em></strong>"
    );

    text = text.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    text = text.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );


    // Headings
    text = text.replace(
        /^### (.*)$/gm,
        "<h3>$1</h3>"
    );

    text = text.replace(
        /^## (.*)$/gm,
        "<h2>$1</h2>"
    );

    text = text.replace(
        /^# (.*)$/gm,
        "<h1>$1</h1>"
    );


    // Horizontal line
    text = text.replace(
        /^---$/gm,
        "<hr>"
    );


    // Numbered list
    text = text.replace(
        /^\d+\.\s+(.*)$/gm,
        "<div class='list-item'>• $1</div>"
    );


    // Bullet list
    text = text.replace(
        /^\*\s+(.*)$/gm,
        "<div class='list-item'>• $1</div>"
    );


    // New lines
    text = text.replace(
        /\n\n/g,
        "<br><br>"
    );

    text = text.replace(
        /\n/g,
        "<br>"
    );


    // Put Mermaid diagrams back
    diagrams.forEach(
        function (diagram, index) {

            const id =
                "diagram-" +
                index;

            const diagramHTML = `
                <div class="note-diagram">
                    <div
                        class="mermaid"
                        data-diagram-id="${id}"
                    >${diagram}</div>
                </div>
            `;

            text = text.replace(
                `___MERMAID_${id}___`,
                diagramHTML
            );
        }
    );


    return text;
}


// ==========================================
// INITIALIZE MERMAID
// ==========================================

if (
    typeof mermaid !== "undefined"
) {

    mermaid.initialize({

        startOnLoad: false,

        securityLevel: "loose",

        theme: "default"

    });

}


// ==========================================
// RENDER MERMAID DIAGRAMS
// ==========================================

async function renderDiagrams() {

    if (
        typeof mermaid === "undefined"
    ) {

        console.error(
            "Mermaid library not loaded."
        );

        return;
    }


    const diagrams =
        document.querySelectorAll(
            ".mermaid"
        );


    if (!diagrams.length) {
        return;
    }


    for (
        let i = 0;
        i < diagrams.length;
        i++
    ) {

        const element =
            diagrams[i];


        // Do not render an already-rendered diagram
        if (
            element.getAttribute(
                "data-rendered"
            ) === "true"
        ) {
            continue;
        }


        const diagramCode =
            element.textContent.trim();


        if (!diagramCode) {
            continue;
        }


        try {

            const id =
                "mermaid-svg-" +
                Date.now() +
                "-" +
                i;


            const result =
                await mermaid.render(
                    id,
                    diagramCode
                );


            element.innerHTML =
                result.svg;


            element.setAttribute(
                "data-rendered",
                "true"
            );


        } catch (error) {

            console.error(
                "Mermaid rendering error:",
                error
            );


            element.innerHTML = `
                <div style="
                    padding:15px;
                    color:#9b4b4b;
                    background:#fff1f1;
                    border-radius:10px;
                ">
                    Diagram could not be rendered.
                </div>
            `;
        }
    }
}


// ==========================================
// REMOVE OLD PDF BUTTON
// ==========================================

function removePDFButton() {

    const oldButton =
        document.querySelector(
            ".pdf-button-container"
        );


    if (oldButton) {
        oldButton.remove();
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

        notesControls.classList.add(
            "hidden"
        );
    }


    if (handwrittenControls) {

        handwrittenControls.classList.add(
            "hidden"
        );
    }


    if (customNotesPages) {

        customNotesPages.classList.add(
            "hidden"
        );
    }


    if (customHandwrittenPages) {

        customHandwrittenPages.classList.add(
            "hidden"
        );
    }
}


// ==========================================
// SHOW NOTES CONTROLS
// ==========================================

function showNotesControls() {

    hideAllControls();


    const controls =
        document.getElementById(
            "notesControls"
        );


    if (controls) {

        controls.classList.remove(
            "hidden"
        );
    }
}


// ==========================================
// SHOW HANDWRITTEN CONTROLS
// ==========================================

function showHandwrittenControls() {

    hideAllControls();


    const controls =
        document.getElementById(
            "handwrittenControls"
        );


    if (controls) {

        controls.classList.remove(
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

    const select =
        document.getElementById(
            selectId
        );

    const customInput =
        document.getElementById(
            customInputId
        );


    let pageCount = 1;


    if (select) {

        if (
            select.value === "custom"
        ) {

            pageCount =
                parseInt(
                    customInput?.value
                ) || 1;

        } else {

            pageCount =
                parseInt(
                    select.value
                ) || 1;
        }
    }


    return Math.max(
        1,
        Math.min(
            pageCount,
            10
        )
    );
}


// ==========================================
// SPLIT INTO PAGES
// ==========================================

function splitPages(text) {

    const regex =
        /PAGE\s*\d+\s*([\s\S]*?)(?=PAGE\s*\d+|$)/gi;


    const pages = [];

    let match;


    while (
        (match =
            regex.exec(text)) !== null
    ) {

        const content =
            match[1].trim();


        if (content) {

            pages.push(
                content
            );
        }
    }


    if (
        pages.length === 0
    ) {

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
    filename
) {

    removePDFButton();


    const answer =
        document.getElementById(
            "answer"
        );


    if (!answer) {
        return;
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


    button.type =
        "button";


    button.innerText =
        "📄 Download PDF";


    button.addEventListener(
        "click",
        function () {

            downloadPDF(
                filename
            );

        }
    );


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
    filename
) {

    if (
        typeof html2pdf ===
        "undefined"
    ) {

        alert(
            "PDF generator is not loaded. Please refresh the page."
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

        button.disabled =
            true;
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

    removePDFButton();


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


    if (!question) {

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


        if (
            !response.ok ||
            data.error
        ) {

            answer.innerText =
                "Error: " +
                (
                    data.error ||
                    "Unable to get an answer."
                );

            return;
        }


        answer.innerHTML =
            formatAnswer(
                data.answer
            );


        await renderDiagrams();


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

    removePDFButton();


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


    let diagramInstruction = "";


    if (
        diagramChoice === "yes"
    ) {

        diagramInstruction = `

IMPORTANT:
The user selected "Include Diagram: Yes".

You MUST include exactly ONE useful diagram.

Use Mermaid syntax.

The Mermaid diagram MUST be placed at the end of the notes.

Use exactly this format:

\`\`\`mermaid
flowchart TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

Replace the example with a diagram relevant to the topic.

Do NOT omit the diagram.
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
            function (
                content,
                index
            ) {

                pagesHTML += `

                    <div
                        class="normal-note-page pdf-page"
                    >

                        <div
                            class="note-page-number"
                        >
                            Page ${index + 1}
                        </div>

                        <div
                            class="note-content"
                        >

                            ${formatAnswer(
                                content
                            )}

                        </div>

                    </div>

                `;
            }
        );


        answer.innerHTML =
            pagesHTML;


        // Render diagram if present
        await renderDiagrams();


        // ALWAYS show PDF button
        addPDFButton(
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

    removePDFButton();


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
        document
            .getElementById(
                "handwrittenDiagram"
            )
            ?.value ||
        "no";


    answer.innerHTML =
        "✍️ Creating handwritten notes...";


    let diagramInstruction = "";


    if (
        diagramChoice === "yes"
    ) {

        diagramInstruction = `

IMPORTANT:
The user selected "Include Diagram: Yes".

You MUST include exactly ONE useful diagram.

Use Mermaid syntax.

The Mermaid diagram MUST be placed at the end of the notes.

Use exactly this format:

\`\`\`mermaid
flowchart TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

Replace the example with a diagram relevant to the topic.

Do NOT omit the diagram.
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
            function (
                content,
                index
            ) {

                pagesHTML += `

                    <div
                        class="
                            handwritten-note
                            pdf-page
                            background-${background}
                            font-${font}
                        "
                    >

                        <div
                            class="note-page-number"
                        >
                            Page ${index + 1}
                        </div>

                        <div
                            class="note-content"
                        >

                            ${formatAnswer(
                                content
                            )}

                        </div>

                    </div>

                `;
            }
        );


        answer.innerHTML =
            pagesHTML;


        // Render diagram if present
        await renderDiagrams();


        // ALWAYS show PDF button
        addPDFButton(
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


        // NOTES CUSTOM PAGE COUNT

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
                            .remove(
                                "hidden"
                            );

                    } else {

                        customNotesPages
                            .classList
                            .add(
                                "hidden"
                            );
                    }

                }
            );
        }


        // HANDWRITTEN CUSTOM PAGE COUNT

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
                            .remove(
                                "hidden"
                            );

                    } else {

                        customHandwrittenPages
                            .classList
                            .add(
                                "hidden"
                            );
                    }

                }
            );
        }

    }
);

