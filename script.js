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
// CREATE A DIAGRAM FROM TOPIC
// ==========================================

function createTopicDiagram(
    topic,
    target
) {

    if (!target) {
        return;
    }


    const lower =
        topic.toLowerCase();


    let diagram = "";


    // ------------------------------
    // SORTING
    // ------------------------------

    if (
        lower.includes("sort") ||
        lower.includes("sorting")
    ) {

        diagram = `
            flowchart TD
                A[Start] --> B[Input Array]
                B --> C[Compare Elements]
                C --> D[Find Correct Position]
                D --> E[Swap or Insert]
                E --> F{More Elements?}
                F -->|Yes| C
                F -->|No| G[Sorted Array]
                G --> H[End]
        `;

    }


    // ------------------------------
    // SEARCHING
    // ------------------------------

    else if (
        lower.includes("search")
    ) {

        diagram = `
            flowchart TD
                A[Start] --> B[Input Array]
                B --> C[Select Element]
                C --> D{Element Found?}
                D -->|Yes| E[Return Position]
                D -->|No| F[Continue Search]
                F --> G{More Elements?}
                G -->|Yes| C
                G -->|No| H[Element Not Found]
                E --> I[End]
                H --> I
        `;

    }


    // ------------------------------
    // ALGORITHM
    // ------------------------------

    else if (
        lower.includes("algorithm") ||
        lower.includes("program")
    ) {

        diagram = `
            flowchart TD
                A[Start] --> B[Input]
                B --> C[Process]
                C --> D{Condition}
                D -->|Yes| E[Perform Operation]
                D -->|No| F[Alternative Operation]
                E --> G[Output]
                F --> G
                G --> H[End]
        `;

    }


    // ------------------------------
    // DATABASE / SQL
    // ------------------------------

    else if (
        lower.includes("sql") ||
        lower.includes("database") ||
        lower.includes("dbms")
    ) {

        diagram = `
            flowchart TD
                A[User] --> B[SQL Query]
                B --> C[Database Management System]
                C --> D[Process Query]
                D --> E[Access Database]
                E --> F[Return Result]
                F --> A
        `;

    }


    // ------------------------------
    // COMPUTER NETWORK
    // ------------------------------

    else if (
        lower.includes("network") ||
        lower.includes("tcp") ||
        lower.includes("http")
    ) {

        diagram = `
            flowchart LR
                A[Sender] --> B[Network]
                B --> C[Receiver]
                C --> D[Response]
                D --> B
                B --> A
        `;

    }


    // ------------------------------
    // OPERATING SYSTEM
    // ------------------------------

    else if (
        lower.includes("operating system") ||
        lower.includes("os")
    ) {

        diagram = `
            flowchart TD
                A[User] --> B[Application]
                B --> C[Operating System]
                C --> D[Hardware]
                D --> C
                C --> B
                B --> A
        `;

    }


    // ------------------------------
    // DEFAULT
    // ------------------------------

    else {

        diagram = `
            flowchart TD
                A[Start] --> B[Understand Topic]
                B --> C[Learn Main Concepts]
                C --> D[Apply Knowledge]
                D --> E[Review]
                E --> F[End]
        `;
    }


    target.innerHTML = `
        <div class="note-diagram">
            <div
                class="mermaid"
            >${diagram.trim()}</div>
        </div>
    `;
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
// =========================================
async function downloadPDF(filename) {

    if (typeof html2pdf === "undefined") {

        alert("PDF generator is not loaded. Please refresh the page.");

        return;
    }

    const answer = document.getElementById("answer");

    if (!answer) {
        return;
    }

    const button = document.querySelector(".pdf-button");

    if (button) {
        button.innerText = "⏳ Creating PDF...";
        button.disabled = true;
    }

    let pdfContainer = null;

    try {

        // ==================================
        // CREATE PDF CONTAINER
        // ==================================

        pdfContainer = document.createElement("div");

        pdfContainer.id = "studysphere-pdf-container";

        pdfContainer.style.position = "fixed";
        pdfContainer.style.left = "10px";
        pdfContainer.style.top = "10px";
        pdfContainer.style.width = "794px";
        pdfContainer.style.background = "#ffffff";
        pdfContainer.style.padding = "20px";
        pdfContainer.style.boxSizing = "border-box";

        // IMPORTANT:
        // Do NOT use z-index:-1
        // Do NOT use display:none
        // Do NOT use visibility:hidden

        pdfContainer.style.zIndex = "999999";
        pdfContainer.style.opacity = "0.01";
        pdfContainer.style.pointerEvents = "none";

        // ==================================
        // GET NOTE PAGES
        // ==================================

        const pages = answer.querySelectorAll(
            ".normal-note-page, .handwritten-note"
        );

        if (!pages.length) {

            throw new Error("No note pages found.");
        }

        // ==================================
        // COPY EACH PAGE
        // ==================================

        pages.forEach(function(page) {

            const clone = page.cloneNode(true);

            // Remove animations
            clone.style.animation = "none";

            // Remove handwritten rotation
            clone.style.transform = "none";

            // Remove shadows
            clone.style.boxShadow = "none";

            // PDF width
            clone.style.width = "100%";
            clone.style.maxWidth = "none";

            // Spacing
            clone.style.margin = "0 0 20px 0";

            clone.style.boxSizing = "border-box";

            // Prevent page splitting
            clone.style.pageBreakInside = "avoid";
            clone.style.breakInside = "avoid";

            pdfContainer.appendChild(clone);
        });

        // ==================================
        // ADD TO DOCUMENT
        // ==================================

        document.body.appendChild(pdfContainer);

        // ==================================
        // WAIT FOR RENDERING
        // ==================================

        await new Promise(function(resolve) {

            requestAnimationFrame(function() {

                requestAnimationFrame(function() {

                    setTimeout(resolve, 300);

                });

            });

        });

        // ==================================
        // CREATE PDF
        // ==================================

        const options = {

            margin: 10,

            filename: filename,

            image: {
                type: "jpeg",
                quality: 0.98
            },

            html2canvas: {

                scale: 2,

                useCORS: true,

                allowTaint: true,

                backgroundColor: "#ffffff",

                logging: false,

                scrollX: 0,

                scrollY: 0,

                windowWidth: 794,

                windowHeight: pdfContainer.scrollHeight
            },

            jsPDF: {

                unit: "mm",

                format: "a4",

                orientation: "portrait",

                compress: true
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
            .from(pdfContainer)
            .save();

    }

    catch (error) {

        console.error(
            "StudySphere PDF Error:",
            error
        );

        alert(
            "Unable to create PDF. Please try again."
        );
    }

    finally {

        // ==================================
        // REMOVE TEMPORARY CONTAINER
        // ==================================

        if (pdfContainer) {

            pdfContainer.remove();
        }

        // ==================================
        // RESET BUTTON
        // ==================================

        if (button) {

            button.innerText = "📄 Download PDF";

            button.disabled = false;
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
- Do not mention these instructions.`

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


        let html = "";


        pages.forEach(
            function (
                content,
                index
            ) {

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


        // Create diagram separately
        if (
            diagramChoice === "yes"
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
                    Diagram
                </div>

                <div class="note-content">
                    <h2>📊 Diagram</h2>
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


            createTopicDiagram(
                question,
                diagramTarget
            );


            await renderDiagrams();
        }


        // PDF button
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
8. Do not mention these instructions.`

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


        let html = "";


        pages.forEach(
            function (
                content,
                index
            ) {

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


        // Create diagram separately
        if (
            diagramChoice === "yes"
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
                    Diagram
                </div>

                <div class="note-content">

                    <h2>📊 Diagram</h2>

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


            createTopicDiagram(
                question,
                diagramTarget
            );


            await renderDiagrams();
        }


        // PDF button
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
