/* =========================================================
   STUDYSPHERE
   Complete JavaScript
========================================================= */


/* =========================================================
   API
========================================================= */

const API_URL =
    "https://ai-study-assistant.anshikasaxena50.workers.dev";


/* =========================================================
   MERMAID
========================================================= */

if (typeof mermaid !== "undefined") {

    mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose"
    });

}


/* =========================================================
   FORMAT ANSWER
========================================================= */

function formatAnswer(text) {

    if (!text) {
        return "";
    }

    let safeText =
        String(text);

    /*
        Protect Mermaid blocks
    */

    const mermaidBlocks = [];

    safeText =
        safeText.replace(
            /```mermaid\s*([\s\S]*?)```/gi,
            function(match, code) {

                const index =
                    mermaidBlocks.length;

                mermaidBlocks.push(
                    code.trim()
                );

                return (
                    "___MERMAID_BLOCK_" +
                    index +
                    "___"
                );
            }
        );


    /*
        Escape HTML
    */

    safeText =
        safeText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");


    /*
        Headings
    */

    safeText =
        safeText.replace(
            /^### (.*)$/gm,
            "<h4>$1</h4>"
        );

    safeText =
        safeText.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );

    safeText =
        safeText.replace(
            /^# (.*)$/gm,
            "<h2>$1</h2>"
        );


    /*
        Bold
    */

    safeText =
        safeText.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
        Inline code
    */

    safeText =
        safeText.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    /*
        Bullet points
    */

    safeText =
        safeText.replace(
            /^\s*[-*]\s+(.*)$/gm,
            "<li>$1</li>"
        );


    safeText =
        safeText.replace(
            /(<li>.*<\/li>\s*)+/gs,
            function(match) {

                return (
                    "<ul>" +
                    match +
                    "</ul>"
                );
            }
        );


    /*
        Numbered lists
    */

    safeText =
        safeText.replace(
            /^\s*\d+\.\s+(.*)$/gm,
            "<li>$1</li>"
        );


    /*
        Paragraphs
    */

    safeText =
        safeText.replace(
            /\n{2,}/g,
            "</p><p>"
        );

    safeText =
        safeText.replace(
            /\n/g,
            "<br>"
        );


    safeText =
        "<p>" +
        safeText +
        "</p>";


    /*
        Restore Mermaid
    */

    mermaidBlocks.forEach(
        function(code, index) {

            const placeholder =
                "___MERMAID_BLOCK_" +
                index +
                "___";

            const diagram =
                `
                <div class="note-diagram">
                    <div class="mermaid">
                        ${code}
                    </div>
                </div>
                `;

            safeText =
                safeText.replace(
                    placeholder,
                    diagram
                );
        }
    );


    return safeText;
}


/* =========================================================
   EXTRACT MERMAID
========================================================= */

function extractMermaidDiagram(text) {

    if (!text) {
        return "";
    }

    const match =
        text.match(
            /```mermaid\s*([\s\S]*?)```/i
        );

    if (!match) {
        return "";
    }

    return match[1].trim();
}


/* =========================================================
   REMOVE MERMAID
========================================================= */

function removeMermaidDiagram(text) {

    if (!text) {
        return "";
    }

    return text.replace(
        /```mermaid\s*([\s\S]*?)```/gi,
        ""
    ).trim();
}


/* =========================================================
   RENDER DIAGRAMS
========================================================= */

async function renderDiagrams() {

    if (
        typeof mermaid === "undefined"
    ) {
        return;
    }

    try {

        await mermaid.run({
            querySelector: ".mermaid"
        });

    } catch (error) {

        console.error(
            "Mermaid rendering error:",
            error
        );

    }
}


/* =========================================================
   CONTROLS
========================================================= */

function hideAllControls() {

    document
        .getElementById("notesControls")
        ?.classList.add("hidden");

    document
        .getElementById("handwrittenControls")
        ?.classList.add("hidden");
}


function showNotesControls() {

    hideAllControls();

    document
        .getElementById("notesControls")
        ?.classList.remove("hidden");
}


function showHandwrittenControls() {

    hideAllControls();

    document
        .getElementById("handwrittenControls")
        ?.classList.remove("hidden");
}


/* =========================================================
   PAGE COUNT
========================================================= */

function getPageCount(type) {

    let select;
    let custom;

    if (type === "notes") {

        select =
            document.getElementById(
                "notesPageNumber"
            );

        custom =
            document.getElementById(
                "customNotesPages"
            );

    } else {

        select =
            document.getElementById(
                "handwrittenPageNumber"
            );

        custom =
            document.getElementById(
                "customHandwrittenPages"
            );
    }


    if (!select) {
        return 1;
    }


    if (select.value === "custom") {

        const number =
            parseInt(
                custom.value,
                10
            );

        if (
            isNaN(number) ||
            number < 1
        ) {
            return 1;
        }

        return Math.min(
            number,
            20
        );
    }


    return parseInt(
        select.value,
        10
    ) || 1;
}


/* =========================================================
   SPLIT PAGES
========================================================= */

function splitPages(text, pageCount) {

    if (!text) {
        return [];
    }

    const cleanText =
        text.trim();


    /*
        Try explicit PAGE markers first
    */

    const explicitPages =
        cleanText.split(
            /\n\s*PAGE\s+\d+\s*\n/gi
        );


    if (
        explicitPages.length > 1
    ) {

        return explicitPages
            .map(
                page =>
                    page.trim()
            )
            .filter(Boolean)
            .slice(
                0,
                pageCount
            );
    }


    /*
        Otherwise split naturally
    */

    const words =
        cleanText.split(/\s+/);

    const wordsPerPage =
        Math.ceil(
            words.length /
            pageCount
        );

    const pages = [];

    for (
        let i = 0;
        i < words.length;
        i += wordsPerPage
    ) {

        pages.push(
            words
                .slice(
                    i,
                    i + wordsPerPage
                )
                .join(" ")
        );
    }


    return pages;
}


/* =========================================================
   PDF BUTTON
========================================================= */

function removePDFButton() {

    const oldButton =
        document.querySelector(
            ".pdf-button-container"
        );

    if (oldButton) {
        oldButton.remove();
    }
}


function addPDFButton() {

    removePDFButton();

    const container =
        document.createElement("div");

    container.className =
        "pdf-button-container";


    const button =
        document.createElement("button");

    button.className =
        "pdf-button";

    button.textContent =
        "📄 Print / Save as PDF";

    button.onclick =
        downloadPDF;


    container.appendChild(
        button
    );


    document.body.appendChild(
        container
    );
}


/* =========================================================
   DOWNLOAD / PRINT PDF
========================================================= */

function downloadPDF() {

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
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups to print or save the PDF."
        );

        return;
    }


    const styles =
        Array.from(
            document.styleSheets
        )
        .map(function(sheet) {

            try {

                return Array.from(
                    sheet.cssRules
                )
                .map(
                    rule =>
                        rule.cssText
                )
                .join("\n");

            } catch (error) {

                return "";
            }

        })
        .join("\n");


    printWindow.document.write(
        `
        <!DOCTYPE html>

        <html>

        <head>

            <title>StudySphere Notes</title>

            <style>

                ${styles}

                body {
                    background: white !important;
                    padding: 20px !important;
                }

                .pdf-button-container {
                    display: none !important;
                }

                @page {
                    size: A4;
                    margin: 15mm;
                }

            </style>

        </head>

        <body>

            ${answer.innerHTML}

        </body>

        </html>
        `
    );


    printWindow.document.close();


    printWindow.onload =
        function() {

            setTimeout(
                function() {

                    printWindow.focus();

                    printWindow.print();

                },
                700
            );
        };
}


/* =========================================================
   ASK AI
========================================================= */

async function askAI() {

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

        answer.innerHTML =
            `
            <div class="answer-card">
                <p>Please enter a question.</p>
            </div>
            `;

        return;
    }


    hideAllControls();

    removePDFButton();


    answer.innerHTML =
        `
        <div class="answer-card">
            <p>🤔 Thinking...</p>
        </div>
        `;


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
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

            answer.innerHTML =
                `
                <div class="answer-card">

                    <p>
                        Error:
                        ${
                            data.error ||
                            "Unable to get an answer."
                        }
                    </p>

                </div>
                `;

            return;
        }


        answer.innerHTML =
            `
            <div class="answer-card">

                ${formatAnswer(
                    data.answer
                )}

            </div>
            `;


        await renderDiagrams();


    } catch (error) {

        console.error(
            "Ask AI error:",
            error
        );


        answer.innerHTML =
            `
            <div class="answer-card">

                <p>
                    Unable to connect to
                    StudySphere AI.
                    Please try again.
                </p>

            </div>
            `;
    }
}


/* =========================================================
   MAKE NOTES
========================================================= */

async function makeNotes() {

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

        answer.innerHTML =
            `
            <div class="answer-card">
                <p>Please enter a topic first.</p>
            </div>
            `;

        return;
    }


    showNotesControls();

    removePDFButton();


    const pageCount =
        getPageCount(
            "notes"
        );


    const includeDiagram =
        document
            .getElementById(
                "notesDiagram"
            )
            .value === "yes";


    answer.innerHTML =
        `
        <div class="answer-card">

            <p>
                📝 Creating
                ${pageCount}
                page(s) of notes...
            </p>

        </div>
        `;


    let diagramInstruction =
        "";


    if (includeDiagram) {

        diagramInstruction =
            `
IMPORTANT DIAGRAM INSTRUCTION:

Also create ONE topic-specific Mermaid
diagram inside:

\`\`\`mermaid
...
\`\`\`

The diagram must:

- Be directly related to the topic.
- Help understand the topic visually.
- Use 6–12 meaningful nodes.
- Use suitable Mermaid shapes.
- Avoid generic Start → Process → End diagrams.
- Use short labels.
- Be clean and A4 printable.
- Represent actual concepts, relationships,
  steps, components, classifications,
  architecture, or flow related to the topic.

Do not explain the Mermaid code separately.
`;
    }


    const prompt =
        `
You are helping a college student prepare
for exams.

Topic:
${question}

Create clear, simple,
exam-oriented notes.

The student requested:
${pageCount} page(s).

Structure the notes naturally according
to the topic.

Important requirements:

- Use simple language.
- Include important definitions.
- Include important concepts.
- Include examples where useful.
- Use headings and bullet points.
- Do not add unnecessary information.
- Make the content suitable for college exams.
- Cover the topic properly.
- Divide the content across approximately
  ${pageCount} pages.
- Mark pages as:

PAGE 1
PAGE 2
PAGE 3

and so on.

Do not make every page artificially equal.
Keep related information together.

${diagramInstruction}
`;


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            question:
                                prompt
                        })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.error
        ) {

            answer.innerHTML =
                `
                <div class="answer-card">

                    <p>
                        Error:
                        ${
                            data.error ||
                            "Unable to create notes."
                        }
                    </p>

                </div>
                `;

            return;
        }


        const rawAnswer =
            data.answer || "";


        const diagram =
            extractMermaidDiagram(
                rawAnswer
            );


        const notesWithoutDiagram =
            removeMermaidDiagram(
                rawAnswer
            );


        const pages =
            splitPages(
                notesWithoutDiagram,
                pageCount
            );


        let html = "";


        pages.forEach(
            function(page, index) {

                html +=
                    `
                    <div class="answer-card">

                        <h3>
                            📝 Page
                            ${index + 1}
                        </h3>

                        ${formatAnswer(
                            page
                        )}

                    </div>
                    `;
            }
        );


        if (
            includeDiagram &&
            diagram
        ) {

            html +=
                `
                <div class="answer-card">

                    <h3>
                        📊 Visual Summary
                    </h3>

                    <div class="note-diagram">

                        <div class="mermaid">
                            ${diagram}
                        </div>

                    </div>

                </div>
                `;
        }


        answer.innerHTML =
            html;


        await renderDiagrams();


        addPDFButton();


    } catch (error) {

        console.error(
            "Make Notes error:",
            error
        );


        answer.innerHTML =
            `
            <div class="answer-card">

                <p>
                    Unable to create notes.
                    Please try again.
                </p>

            </div>
            `;
    }
}


/* =========================================================
   HANDWRITTEN NOTES
========================================================= */

async function handwrittenNotes() {

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

        answer.innerHTML =
            `
            <div class="answer-card">

                <p>
                    Please enter a topic first.
                </p>

            </div>
            `;

        return;
    }


    showHandwrittenControls();

    removePDFButton();


    const pageCount =
        getPageCount(
            "handwritten"
        );


    const background =
        document
            .getElementById(
                "pageBackground"
            )
            .value;


    const font =
        document
            .getElementById(
                "handwrittenFont"
            )
            .value;


    const includeDiagram =
        document
            .getElementById(
                "handwrittenDiagram"
            )
            .value === "yes";


    answer.innerHTML =
        `
        <div class="answer-card">

            <p>
                ✍️ Creating handwritten notes...
            </p>

        </div>
        `;


    let diagramInstruction =
        "";


    if (includeDiagram) {

        diagramInstruction =
            `
Also create ONE topic-specific Mermaid
diagram using:

\`\`\`mermaid
...
\`\`\`

Requirements:

- Directly related to the topic.
- Useful for understanding the topic.
- 6–12 meaningful nodes.
- Suitable Mermaid shapes.
- Short labels.
- Clean and printable.
- Not a generic Start → Process → End diagram.
`;
    }


    const prompt =
        `
You are creating handwritten-style
college study notes.

Topic:
${question}

Create simple exam-oriented notes
for ${pageCount} page(s).

Requirements:

- Use simple language.
- Include definitions.
- Include important concepts.
- Include examples where useful.
- Use headings.
- Use bullet points.
- Keep the content exam-focused.
- Avoid unnecessary details.

Divide the content naturally.

Use:

PAGE 1
PAGE 2
PAGE 3

and so on.

Do not make every page artificially equal.

${diagramInstruction}
`;


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            question:
                                prompt
                        })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.error
        ) {

            answer.innerHTML =
                `
                <div class="answer-card">

                    <p>
                        Error:
                        ${
                            data.error ||
                            "Unable to create handwritten notes."
                        }
                    </p>

                </div>
                `;

            return;
        }


        const rawAnswer =
            data.answer || "";


        const diagram =
            extractMermaidDiagram(
                rawAnswer
            );


        const notesWithoutDiagram =
            removeMermaidDiagram(
                rawAnswer
            );


        const pages =
            splitPages(
                notesWithoutDiagram,
                pageCount
            );


        let html = "";


        pages.forEach(
            function(page) {

                html +=
                    `
                    <div
                        class="
                            handwritten-page
                            bg-${background}
                            font-${font}
                        "
                    >

                        ${formatAnswer(
                            page
                        )}

                    </div>
                    `;
            }
        );


        if (
            includeDiagram &&
            diagram
        ) {

            html +=
                `
                <div
                    class="
                        handwritten-page
                        bg-${background}
                        font-${font}
                    "
                >

                    <h2>
                        📊 Visual Summary
                    </h2>

                    <div class="note-diagram">

                        <div class="mermaid">
                            ${diagram}
                        </div>

                    </div>

                </div>
                `;
        }


        answer.innerHTML =
            html;


        await renderDiagrams();


        addPDFButton();


    } catch (error) {

        console.error(
            "Handwritten Notes error:",
            error
        );


        answer.innerHTML =
            `
            <div class="answer-card">

                <p>
                    Unable to create handwritten
                    notes. Please try again.
                </p>

            </div>
            `;
    }
}


/* =========================================================
   STUDY MODE
========================================================= */

function openStudyMode() {

    const studyMode =
        document.getElementById(
            "studyMode"
        );


    if (!studyMode) {
        return;
    }


    studyMode.classList.remove(
        "hidden"
    );


    showStudyStep(
        "learn"
    );


    studyMode.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   STUDY MODE NAVIGATION
========================================================= */

function showStudyStep(step) {

    const steps = [
        "learn",
        "practice",
        "test",
        "revise"
    ];


    steps.forEach(
        function(item) {

            const section =
                document.getElementById(
                    "study" +
                    item
                        .charAt(0)
                        .toUpperCase() +
                    item.slice(1) +
                    "Step"
                );


            if (section) {

                section.classList.add(
                    "hidden"
                );
            }
        }
    );


    const selected =
        document.getElementById(
            "study" +
            step
                .charAt(0)
                .toUpperCase() +
            step.slice(1) +
            "Step"
        );


    if (selected) {

        selected.classList.remove(
            "hidden"
        );
    }


    document
        .querySelectorAll(
            ".study-step"
        )
        .forEach(
            function(button, index) {

                button.classList.toggle(
                    "active",
                    steps[index] === step
                );
            }
        );
}


/* =========================================================
   STUDY MODE LEARN
========================================================= */

async function studyLearn() {

    const topic =
        document
            .getElementById(
                "studyTopic"
            )
            .value
            .trim();


    const result =
        document.getElementById(
            "studyResult"
        );


    if (!topic) {

        result.innerHTML =
            `
            <div class="study-empty-card">

                <span>⚠️</span>

                <p>
                    Please enter a topic first.
                </p>

            </div>
            `;

        return;
    }


    result.innerHTML =
        `
        <div class="study-empty-card">

            <span>📚</span>

            <p>
                Learning about
                <strong>${topic}</strong>...
            </p>

        </div>
        `;


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            question:
                                `
You are helping a college student
learn a topic for exams.

Topic:
${topic}

Explain this topic in simple,
clear, exam-oriented language.

Structure the response as:

1. What is it?
2. Main idea
3. Important concepts
4. Simple example
5. Key points to remember

Rules:

- Keep it easy to understand.
- Avoid unnecessary detail.
- Use headings and bullet points.
- Explain technical terms briefly.
- Make it useful for exam preparation.
- Do not mention these instructions.
                                `
                        })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            data.error
        ) {

            result.innerHTML =
                `
                <div class="study-empty-card">

                    <span>⚠️</span>

                    <p>
                        Error:
                        ${
                            data.error ||
                            "Unable to load the topic."
                        }
                    </p>

                </div>
                `;

            return;
        }


        result.innerHTML =
            `
            <div class="study-learn-card">

                <h3>
                    📚 ${topic}
                </h3>

                <div>

                    ${formatAnswer(
                        data.answer
                    )}

                </div>

            </div>
            `;


        await renderDiagrams();


    } catch (error) {

        console.error(
            "Study Mode error:",
            error
        );


        result.innerHTML =
            `
            <div class="study-empty-card">

                <span>⚠️</span>

                <p>
                    Unable to connect to
                    StudySphere AI.
                    Please try again.
                </p>

            </div>
            `;
    }
}


/* =========================================================
   CUSTOM PAGE INPUTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

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

                    customNotesPages.classList.toggle(
                        "hidden",
                        this.value !== "custom"
                    );

                }
            );
        }


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

                    customHandwrittenPages.classList.toggle(
                        "hidden",
                        this.value !== "custom"
                    );

                }
            );
        }


        /*
            Enter key for main question
        */

        const question =
            document.getElementById(
                "question"
            );


        if (question) {

            question.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        askAI();
                    }

                }
            );
        }


        /*
            Enter key for Study Mode topic
        */

        const studyTopic =
            document.getElementById(
                "studyTopic"
            );


        if (studyTopic) {

            studyTopic.addEventListener(
                "keydown",
                function(event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        studyLearn();
                    }

                }
            );
        }

    }
);
