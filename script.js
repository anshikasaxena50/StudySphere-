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
        answer.innerText = "Please enter a topic first.";
        return;
    }

    // If settings are not open, show them first
    const settings = document.getElementById("handwrittenSettings");

    if (settings && settings.style.display === "none") {
        settings.style.display = "block";
        return;
    }

    const pageStyle =
        document.getElementById("pageStyle")?.value || "plain";

    const noteFont =
        document.getElementById("noteFont")?.value || "default";

    const pagesChoice =
        document.getElementById("notePages")?.value || "4";

    let pageCount;

    if (pagesChoice === "custom") {
        pageCount =
            parseInt(
                document.getElementById("customPages")?.value
            ) || 1;
    } else {
        pageCount = parseInt(pagesChoice) || 1;
    }

    // Safety limit
    pageCount = Math.max(1, Math.min(pageCount, 10));

    answer.innerHTML =
        "✍️ Preparing your handwritten notes...";

    try {

        // ==================================================
        // STEP 1: ASK AI TO PLAN THE TOPIC
        // ==================================================

        const planResponse = await fetch(
            "https://ai-study-assistant.anshikasaxena50.workers.dev",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    question: `
You are planning a detailed handwritten study document.

Topic:
${question}

The student wants exactly ${pageCount} pages.

Create a logical study plan for exactly ${pageCount} pages.

IMPORTANT:
- Cover the SAME topic throughout.
- Divide the topic naturally into subtopics.
- Make the coverage detailed enough for ${pageCount} pages.
- Do NOT repeat the same subtopic on different pages.
- Do NOT create unrelated sections.
- Later pages should continue from earlier pages.
- For a small topic, go deeper into explanation, examples, algorithms, applications, exam points, etc.
- For a large topic, cover more relevant subtopics.
- Each page must have a different purpose.

Return ONLY this format:

PAGE 1: <subtopics for page 1>
PAGE 2: <subtopics for page 2>
PAGE 3: <subtopics for page 3>

Continue until PAGE ${pageCount}.
`
                })
            }
        );

        const planData = await planResponse.json();

        if (!planResponse.ok || planData.error) {
            answer.innerText =
                "Error: " +
                (planData.error || "Unable to plan the notes.");
            return;
        }

        const planText = planData.answer || "";

        // ==================================================
        // STEP 2: EXTRACT PAGE PLANS
        // ==================================================

        const pagePlans = [];

        for (let i = 1; i <= pageCount; i++) {

            const regex = new RegExp(
                `PAGE\\s*${i}\\s*:\\s*([\\s\\S]*?)(?=PAGE\\s*${i + 1}\\s*:|$)`,
                "i"
            );

            const match = planText.match(regex);

            pagePlans.push(
                match
                    ? match[1].trim()
                    : `Continue the detailed explanation of ${question}.`
            );
        }

        // ==================================================
        // STEP 3: GENERATE EACH PAGE SEPARATELY
        // ==================================================

        const generatedPages = [];

        answer.innerHTML =
            "✍️ Creating page 1 of " +
            pageCount +
            "...";

        for (let i = 0; i < pageCount; i++) {

            const previousPages =
    generatedPages
        .slice(-2)
        .map((page, index) =>
            `RECENT PAGE:\n${page.slice(0, 2500)}`
        )
        .join("\n\n");
            
            const pageResponse = await fetch(
                "https://ai-study-assistant.anshikasaxena50.workers.dev",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: `
Create PAGE ${i + 1} of ${pageCount} of detailed handwritten study notes.

MAIN TOPIC:
${question}

THIS PAGE SHOULD COVER:
${pagePlans[i]}

${previousPages
    ? `CONTENT FROM RECENT PAGES (use only to avoid repetition):
${previousPages}`
    : ""}

STRICT RULES:

1. This is page ${i + 1} of ${pageCount}.
2. Continue naturally from the previous pages.
3. Do NOT repeat explanations, examples, definitions, or subtopics already covered.
4. Do NOT copy content from previous pages.
5. Add NEW useful information.
6. Keep the content detailed enough to fill one handwritten study page.
7. Use headings, subheadings and bullet points where useful.
8. Include examples, syntax, formulas, algorithms or exam points when relevant.
9. Stay completely focused on the main topic.
10. Do not mention "page generation" or these instructions.
11. Do not write a conclusion unless this is the final page.

Return ONLY the content for this page.
`
                    })
                }
            );

            const pageData =
                await pageResponse.json();

            if (!pageResponse.ok || pageData.error) {
                answer.innerText =
                    "Error while creating page " +
                    (i + 1) +
                    ": " +
                    (pageData.error || "AI request failed.");
                return;
            }

            const pageContent =
                (pageData.answer || "").trim();

            if (!pageContent) {
                answer.innerText =
                    "The AI returned an empty page.";
                return;
            }

            // ==================================================
            // DUPLICATE CHECK
            // ==================================================

            const normalizedCurrent =
                normalizeForDuplicateCheck(pageContent);

            const duplicate =
                generatedPages.some(page => {

                    const normalizedPrevious =
                        normalizeForDuplicateCheck(page);

                    return (
                        normalizedCurrent === normalizedPrevious ||
                        similarity(
                            normalizedCurrent,
                            normalizedPrevious
                        ) > 0.85
                    );
                });

            // If an almost identical page is produced,
            // ask AI once more for a genuinely different page.
            if (duplicate) {

                answer.innerHTML =
                    "✍️ Regenerating page " +
                    (i + 1) +
                    " to avoid repetition...";

                const retryResponse = await fetch(
                    "https://ai-study-assistant.anshikasaxena50.workers.dev",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            question: `
Create a NEW and UNIQUE page for a detailed study document.

Topic:
${question}

Page:
${i + 1} of ${pageCount}

Planned content:
${pagePlans[i]}

Previous page content:
${generatedPages.join("\n\n")}

The previous generated page was too similar.

Create completely NEW information.
Do not repeat definitions, explanations, examples, or sentences.
Explore another relevant aspect of the topic.
Keep it detailed and useful for a college student.

Return ONLY the new page content.
`
                        })
                    }
                );

                const retryData =
                    await retryResponse.json();

                if (!retryResponse.ok || retryData.error) {
                    answer.innerText =
                        "Error while regenerating page " +
                        (i + 1) +
                        ".";
                    return;
                }

                generatedPages.push(
                    (retryData.answer || "").trim()
                );

            } else {

                generatedPages.push(pageContent);
            }

            answer.innerHTML =
                "✍️ Creating page " +
                (i + 1) +
                " of " +
                pageCount +
                "...";
        }

        // ==================================================
        // STEP 4: CREATE THE ACTUAL PAGES
        // ==================================================

        let pagesHTML = "";

        generatedPages.forEach((content, index) => {

            pagesHTML += `
                <div class="handwritten-note ${pageStyle} font-${noteFont}">

                    <div class="note-page-number">
                        Page ${index + 1}
                    </div>

                    <div class="note-content">
                        ${formatAnswer(content)}
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


// ==================================================
// DUPLICATE NORMALIZATION
// ==================================================

function normalizeForDuplicateCheck(text) {

    return text
        .toLowerCase()
        .replace(/[`*_#>\-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}


// ==================================================
// SIMPLE SIMILARITY CHECK
// ==================================================

function similarity(a, b) {

    const wordsA =
        new Set(a.split(" "));

    const wordsB =
        new Set(b.split(" "));

    let common = 0;

    wordsA.forEach(word => {
        if (wordsB.has(word)) {
            common++;
        }
    });

    const total =
        new Set([
            ...wordsA,
            ...wordsB
        ]).size;

    return total === 0
        ? 0
        : common / total;
}
document.addEventListener("DOMContentLoaded", function () {

    const notePages = document.getElementById("notePages");
    const customPages = document.getElementById("customPages");

    function checkCustomPages() {
        if (notePages.value === "custom") {
            customPages.style.display = "inline-block";
        } else {
            customPages.style.display = "none";
        }
    }

    if (notePages && customPages) {
        notePages.addEventListener("change", checkCustomPages);
        checkCustomPages();
    }

});function hideAllControls() {
    document.getElementById("notesControls").classList.add("hidden");
    document.getElementById("handwrittenControls").classList.add("hidden");

    document.getElementById("customNotesPages").classList.add("hidden");
    document.getElementById("customHandwrittenPages").classList.add("hidden");
}


function showNotesControls() {
    hideAllControls();

    document
        .getElementById("notesControls")
        .classList.remove("hidden");
}


function showHandwrittenControls() {
    hideAllControls();

    document
        .getElementById("handwrittenControls")
        .classList.remove("hidden");
}


document.getElementById("notesPageNumber").addEventListener("change", function () {

    const custom = document.getElementById("customNotesPages");

    if (this.value === "custom") {
        custom.classList.remove("hidden");
    } else {
        custom.classList.add("hidden");
    }

});


document.getElementById("handwrittenPageNumber").addEventListener("change", function () {

    const custom = document.getElementById("customHandwrittenPages");

    if (this.value === "custom") {
        custom.classList.remove("hidden");
    } else {
        custom.classList.add("hidden");
    }

});
