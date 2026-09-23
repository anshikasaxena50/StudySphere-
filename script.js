````javascript
function formatAnswer(text) {

    if (!text) {
        return "";
    }

    // Temporarily protect Mermaid blocks
    const diagrams = [];

    text = text.replace(
        /```mermaid\s*([\s\S]*?)```/gi,
        function (match, diagram) {

            const id = diagrams.length;

            diagrams.push(
                diagram.trim()
            );

            return `___DIAGRAM_${id}___`;
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


    // Restore Mermaid blocks
    diagrams.forEach(
        function (diagram, index) {

            const diagramHTML = `
                <div class="note-diagram">
                    <div
                        class="mermaid"
                        data-diagram="${index}"
                    >${diagram}</div>
                </div>
            `;

            text = text.replace(
                `___DIAGRAM_${index}___`,
                diagramHTML
            );
        }
    );


    return text;
}


// ==========================================
// EXTRACT MERMAID DIAGRAM
// ==========================================

function extractMermaidDiagram(text) {

    if (!text) {
        return null;
    }


    const match =
        text.match(
            /```mermaid\s*([\s\S]*?)```/i
        );


    if (!match) {
        return null;
    }


    return match[1].trim();
}


// ==========================================
// REMOVE MERMAID FROM NOTES
// ==========================================

function removeMermaidDiagram(text) {

    if (!text) {
        return "";
    }


    return text.replace(
        /```mermaid\s*([\s\S]*?)```/gi,
        ""
    ).trim();
}


// ==========================================
// MERMAID INITIALIZATION
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
// RENDER MERMAID
// ==========================================

async function renderDiagrams() {

    if (
        typeof mermaid === "undefined"
    ) {

        console.warn(
            "Mermaid library is not loaded."
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


        if (
            element.dataset.rendered ===
            "true"
        ) {
            continue;
        }


        const code =
            element.textContent.trim();


        if (!code) {
            continue;
        }


        try {

            const id =
                "diagram-" +
                Date.now() +
                "-" +
                i;


            const result =
                await mermaid.render(
                    id,
                    code
                );


            element.innerHTML =
                result.svg;


            element.dataset.rendered =
                "true";


        } catch (error) {

            console.error(
                "Mermaid error:",
                error
            );


            element.innerHTML = `
                <div class="diagram-error">
                    Diagram could not be generated.
                </div>
            `;
        }
    }
}


// ==========================================
// DISPLAY AI DIAGRAM
// ==========================================

function displayAIDiagram(
    diagram,
    target,
    title = "📊 Visual Summary"
) {

    if (!target || !diagram) {
        return;
    }


    target.innerHTML = `

        <div class="note-diagram">

            <div
                class="mermaid"
            >${diagram}</div>

        </div>

    `;


    renderDiagrams();
}


// ==========================================
// HIDE CONTROLS
// ==========================================

function hideAllControls() {

    const notes =
        document.getElementById(
            "notesControls"
        );

    const handwritten =
        document.getElementById(
            "handwrittenControls"
        );

    const customNotes =
        document.getElementById(
            "customNotesPages"
        );

    const customHandwritten =
        document.getElementById(
            "customHandwrittenPages"
        );


    if (notes) {

        notes.classList.add(
            "hidden"
        );
    }


    if (handwritten) {

        handwritten.classList.add(
            "hidden"
        );
    }


    if (customNotes) {

        customNotes.classList.add(
            "hidden"
        );
    }


    if (customHandwritten) {

        customHandwritten.classList.add(
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
// PAGE COUNT
// ==========================================

function getPageCount(
    selectId,
    customInputId
) {

    const select =
        document.getElementById(
            selectId
        );

    const custom =
        document.getElementById(
            customInputId
        );


    let count = 1;


    if (select) {

        if (
            select.value === "custom"
        ) {

            count =
                parseInt(
                    custom?.value
                ) || 1;

        } else {

            count =
                parseInt(
                    select.value
                ) || 1;
        }
    }


    return Math.max(
        1,
        Math.min(
            count,
            10
        )
    );
}


// ==========================================
// SPLIT PAGES
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
// REMOVE PDF BUTTON
// ==========================================

function removePDFButton() {

    const old =
        document.querySelector(
            ".pdf-button-container"
        );


    if (old) {
        old.remove();
    }
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


    button.type =
        "button";


    button.className =
        "pdf-button";


    button.innerHTML =
        "📄 Download PDF";


    button.onclick =
        function () {

            downloadPDF(
                filename
            );

        };


    container.appendChild(
        button
    );


    answer.appendChild(
        container
    );
}


// ==========================================
// DOWNLOAD PDF
// ==========================================

function downloadPDF(filename) {

    const answer =
        document.getElementById(
            "answer"
        );

    if (!answer) {
        return;
    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups for StudySphere to create the PDF."
        );

        return;
    }


    const content =
        answer.cloneNode(true);


    const pdfButton =
        content.querySelector(
            ".pdf-button-container"
        );


    if (pdfButton) {
        pdfButton.remove();
    }


    let styles = "";


    document
        .querySelectorAll(
            'link[rel="stylesheet"], style'
        )
        .forEach(
            function(element) {

                if (
                    element.tagName
                        .toLowerCase() ===
                    "link"
                ) {

                    styles += `
                        <link
                            rel="stylesheet"
                            href="${element.href}"
                        >
                    `;

                } else {

                    styles += `
                        <style>
                            ${element.innerHTML}
                        </style>
                    `;
                }

            }
        );


    styles += `

        <style>

            @page {
                size: A4;
                margin: 12mm;
            }

            html,
            body {

                margin: 0;
                padding: 0;

                background: white !important;

            }

            body {

                font-family:
                    Arial,
                    sans-serif;

            }

            #answer {

                width: 100% !important;

                margin: 0 !important;

                padding: 0 !important;

            }

            .normal-note-page,
            .handwritten-note {

                width: 100% !important;

                max-width: none !important;

                margin: 0 !important;

                box-sizing: border-box;

                box-shadow: none !important;

                animation: none !important;

                transform: none !important;

                page-break-after: always;

                break-after: page;

                page-break-inside: avoid;

                break-inside: avoid;

            }

            .normal-note-page:last-child,
            .handwritten-note:last-child {

                page-break-after: auto;

                break-after: auto;

            }

            .note-diagram {

                width: 100% !important;

                overflow: visible !important;

                page-break-inside: avoid;

                break-inside: avoid;

            }

            .note-diagram svg {

                max-width: 100% !important;

                height: auto !important;

            }

            h1,
            h2,
            h3 {

                page-break-after: avoid;

                break-after: avoid;

            }

        </style>

    `;


    printWindow.document.open();


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                ${filename.replace(".pdf", "")}
            </title>

            ${styles}

        </head>

        <body>

            ${content.outerHTML}

        </body>

        </html>

    `);


    printWindow.document.close();


    setTimeout(
        function() {

            printWindow.focus();

            printWindow.print();


            setTimeout(
                function() {

                    printWindow.close();

                },
                1500
            );

        },
        1200
    );
}


// ==========================================
// ASK AI
// ==========================================

async function askAI() {

    hideAllControls();
    removePDFButton();


    const question =
        document
            .getElementById("question")
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

        console.error(error);

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
            .getElementById("question")
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
        )?.value ||
        "no";


    answer.innerText =
        "📝 Creating your notes...";


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

${diagramChoice === "yes" ? `

After the notes, create ONE Mermaid diagram that visually summarizes the topic.

The diagram must:
- Be specifically about "${question}".
- Be understandable even without reading the theory.
- Show the most important concepts, steps, relationships or components.
- Use short but meaningful text inside shapes.
- Use suitable Mermaid shapes such as rectangles, rounded boxes, circles, diamonds, cylinders or other appropriate shapes.
- Choose the most suitable layout for this particular topic.
- Use arrows to clearly show relationships or flow.
- Be visually attractive and interesting to read.
- Do not use a generic Start → Process → End diagram.
- Prefer approximately 6–12 meaningful nodes.
- Keep it simple enough for an A4 page.
- Make it useful for exam revision.
- Return the diagram only inside one Mermaid code block.
- Use valid Mermaid syntax.

Example format:

\`\`\`mermaid
flowchart TD
    A[Main Concept] --> B[Important Step]
    B --> C{Decision}
    C -->|Yes| D[Result]
    C -->|No| E[Alternative]
\`\`\`

` : ""}`

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


        // Extract AI-generated diagram
        let diagram = null;


        if (
            diagramChoice === "yes"
        ) {

            diagram =
                extractMermaidDiagram(
                    data.answer
                );

        }


        // Remove diagram from theory
        const notesText =
            removeMermaidDiagram(
                data.answer
            );


        const pages =
            splitPages(
                notesText
            );


        let html = "";


        pages.forEach(
            function(content, index) {

                html += `

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
            html;


        // Add intelligent diagram
        if (
            diagramChoice === "yes" &&
            diagram
        ) {

            const diagramArea =
                document.createElement(
                    "div"
                );


            diagramArea.className =
                "normal-note-page pdf-page";


            diagramArea.innerHTML = `

                <div
                    class="note-page-number"
                >
                    Visual Summary
                </div>

                <div class="note-content">

                    <h2>📊 Visual Summary</h2>

                </div>

            `;


            answer.appendChild(
                diagramArea
            );


            const diagramTarget =
                document.createElement(
                    "div"
                );


            diagramArea
                .querySelector(
                    ".note-content"
                )
                .appendChild(
                    diagramTarget
                );


            displayAIDiagram(
                diagram,
                diagramTarget
            );


            await renderDiagrams();

        }


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
            .getElementById("question")
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
            )?.value ||
        "lined";


    const font =
        document
            .getElementById(
                "handwrittenFont"
            )?.value ||
        "caveat";


    const diagramChoice =
        document
            .getElementById(
                "handwrittenDiagram"
            )?.value ||
        "no";


    answer.innerHTML =
        "✍️ Creating handwritten notes...";


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
2. Do not repeat information.
3. Each page should contain useful new information.
4. Use simple language suitable for a college student.
5. Include definitions, important points, examples, formulas, algorithms, applications or exam points when relevant.
6. Use headings and bullet points where useful.
7. Keep the content suitable for handwritten study notes.
8. Do not mention these instructions.

${diagramChoice === "yes" ? `

After the notes, create ONE Mermaid diagram that visually summarizes the topic.

The diagram must:
- Be specifically about "${question}".
- Be understandable even without reading the theory.
- Show the most important concepts, steps, relationships or components.
- Use short but meaningful text inside shapes.
- Use suitable Mermaid shapes such as rectangles, rounded boxes, circles, diamonds, cylinders or other appropriate shapes.
- Choose the most suitable layout for this particular topic.
- Use arrows to clearly show relationships or flow.
- Be visually attractive and interesting to read.
- Do not use a generic Start → Process → End diagram.
- Prefer approximately 6–12 meaningful nodes.
- Keep it simple enough for an A4 handwritten-note page.
- Make it useful for exam revision.
- Return the diagram only inside one Mermaid code block.
- Use valid Mermaid syntax.

Example format:

\`\`\`mermaid
flowchart TD
    A[Main Concept] --> B[Important Step]
    B --> C{Decision}
    C -->|Yes| D[Result]
    C -->|No| E[Alternative]
\`\`\`

` : ""}`

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


        // Extract AI-generated diagram
        let diagram = null;


        if (
            diagramChoice === "yes"
        ) {

            diagram =
                extractMermaidDiagram(
                    data.answer
                );

        }


        // Remove diagram from handwritten notes
        const notesText =
            removeMermaidDiagram(
                data.answer
            );


        const pages =
            splitPages(
                notesText
            );


        let html = "";


        pages.forEach(
            function(content, index) {

                html += `

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
            html;


        // Add intelligent diagram
        if (
            diagramChoice === "yes" &&
            diagram
        ) {

            const diagramArea =
                document.createElement(
                    "div"
                );


            diagramArea.className = `

                handwritten-note
                pdf-page
                background-${background}
                font-${font}

            `;


            diagramArea.innerHTML = `

                <div
                    class="note-page-number"
                >
                    Visual Summary
                </div>

                <div class="note-content">

                    <h2>📊 Visual Summary</h2>

                </div>

            `;


            answer.appendChild(
                diagramArea
            );


            const diagramTarget =
                document.createElement(
                    "div"
                );


            diagramArea
                .querySelector(
                    ".note-content"
                )
                .appendChild(
                    diagramTarget
                );


            displayAIDiagram(
                diagram,
                diagramTarget
            );


            await renderDiagrams();

        }


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
    function() {

        hideAllControls();


        // Notes custom pages
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
                function() {

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


        // Handwritten custom pages
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
                function() {

                    if (
                        this.value ===
                        "custom"
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
````
