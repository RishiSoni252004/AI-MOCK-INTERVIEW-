const sampleResumeText = `Alex Morgan
Senior Product Designer

EXPERIENCE
Product Designer, Northstar Labs — 2021–Present
- Led end-to-end design for a B2B analytics platform used by 12,000 customers.
- Redesigned onboarding through user research and rapid prototyping, improving activation by 18%.
- Built and documented a design system that reduced design-to-development time by 30%.
- Partnered with product, engineering, and data teams to define quarterly roadmap priorities.
- Mentored two junior designers and facilitated weekly critique sessions.

UX Designer, BrightPay — 2018–2021
- Conducted customer interviews and usability tests for mobile payment experiences.
- Increased checkout completion by 14% through a simplified payment flow.

SKILLS
Product Design, User Research, Figma, Prototyping, Design Systems, Usability Testing, Product Strategy, Data Analysis, Stakeholder Management

EDUCATION
B.Des, Interaction Design`;

const skillVocabulary = [
  "Product Design", "User Research", "Figma", "Prototyping", "Design Systems",
  "Usability Testing", "Product Strategy", "Data Analysis", "Stakeholder Management",
  "JavaScript", "TypeScript", "React", "Python", "SQL", "Machine Learning", "AWS",
  "Project Management", "Leadership", "Agile", "Marketing", "Sales", "Communication",
  "Node.js", "Java", "C++", "UI Design", "UX Design", "Research", "Analytics"
];

const state = {
  resume: "",
  role: "",
  company: "",
  style: "balanced",
  count: 8,
  profile: null,
  questions: [],
  current: 0,
  answers: [],
  startedAt: null,
  timerId: null
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function openApp() {
  $("#appShell").classList.add("open");
  $("#appShell").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeApp() {
  $("#appShell").classList.remove("open");
  $("#appShell").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function showView(name) {
  $$(".app-view").forEach(view => view.classList.remove("active"));
  $(`#${name}View`).classList.add("active");
  const order = ["setup", "review", "interview", "report"];
  const currentIndex = order.indexOf(name);
  $$(".progress-item").forEach((item, index) => {
    item.classList.toggle("active", index === currentIndex);
    item.classList.toggle("done", index < currentIndex);
  });
  $(".app-main").scrollTop = 0;
}

function parseResume(text) {
  const cleanLines = text.split("\n").map(line => line.trim()).filter(Boolean);
  const nameLine = cleanLines.find(line =>
    line.length < 45 &&
    /^[A-Za-z][A-Za-z .'-]+$/.test(line) &&
    !/experience|education|skills|summary|profile/i.test(line)
  ) || "Candidate";

  const titleLine = cleanLines.find((line, index) =>
    index > 0 && index < 6 && line.length < 70 &&
    /(designer|engineer|developer|manager|analyst|consultant|specialist|lead|director|marketing|sales|student)/i.test(line)
  ) || state.role || "Experienced professional";

  const matchedSkills = skillVocabulary.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );

  const bullets = cleanLines
    .filter(line => /^[-•*]/.test(line) || /\b\d+[%+,]|\b(increased|improved|reduced|led|built|launched|created|managed|developed)\b/i.test(line))
    .map(line => line.replace(/^[-•*]\s*/, ""))
    .filter(line => line.length > 25)
    .slice(0, 4);

  const years = [...text.matchAll(/\b(19|20)\d{2}\b/g)].map(match => Number(match[0]));
  if (/\bpresent\b/i.test(text) && years.length) years.push(new Date().getFullYear());
  const yearSpan = years.length > 1 ? Math.max(...years) - Math.min(...years) : null;
  const fallbackSkills = ["Communication", "Problem Solving", "Collaboration"];

  return {
    name: nameLine,
    title: titleLine,
    skills: [...new Set([...matchedSkills, ...fallbackSkills])].slice(0, 8),
    highlights: bullets.length ? bullets : [
      "Demonstrated ownership across key projects and responsibilities.",
      "Worked cross-functionally to deliver meaningful outcomes.",
      "Built relevant experience aligned with the target role."
    ],
    years: yearSpan && yearSpan > 0 ? `${yearSpan}+ years` : "3+ years"
  };
}

function generateQuestions(profile) {
  const role = state.role;
  const companyContext = state.company ? ` at ${state.company}` : "";
  const highlight = profile.highlights[0] || "one of your most important projects";
  const skillA = profile.skills[0] || "your core craft";
  const skillB = profile.skills[1] || "cross-functional collaboration";

  const behavioral = [
    { type: "CAREER STORY", text: `Walk me through your background and what makes this ${role} opportunity the right next step for you.` },
    { type: "RESUME DEEP DIVE", text: `Your resume says you ${lowerFirst(highlight)} What was your personal contribution, and what made the outcome possible?` },
    { type: "BEHAVIORAL", text: "Tell me about a time you had to influence a difficult stakeholder without direct authority. What did you do?" },
    { type: "LEADERSHIP", text: "Describe a project that did not go as planned. How did you respond, and what changed in your approach afterward?" },
    { type: "COLLABORATION", text: `Give me an example of how you worked with people outside your discipline to deliver a better result.` },
    { type: "GROWTH", text: `What is the most useful critical feedback you've received, and how has it changed the way you work?` }
  ];

  const technical = [
    { type: "ROLE EXPERTISE", text: `How do you approach a complex ${role} problem when the requirements are incomplete or ambiguous?` },
    { type: "SKILL DEEP DIVE", text: `You list ${skillA} as a strength. Walk me through a decision where that skill materially changed the outcome.` },
    { type: "PROBLEM SOLVING", text: `Imagine you join us${companyContext} and an important metric drops by 20%. How would you diagnose the problem?` },
    { type: "TRADE-OFFS", text: `Tell me about a time you had to trade speed for quality. How did you make and communicate that decision?` },
    { type: "ROLE EXPERTISE", text: `How do you measure whether your work as a ${role} has been successful?` },
    { type: "SKILL DEEP DIVE", text: `How have you combined ${skillA} and ${skillB} to solve a difficult problem?` }
  ];

  const closers = [
    { type: "MOTIVATION", text: `Why this ${role} role${companyContext}, and what would you hope to accomplish in your first six months?` },
    { type: "SELF-AWARENESS", text: "What is one area you are actively developing, and what are you doing to improve it?" },
    { type: "CLOSING", text: "What haven't I asked that would help me understand why you're a strong fit for this role?" }
  ];

  let pool;
  if (state.style === "behavioral") pool = [...behavioral, ...closers, ...technical];
  else if (state.style === "technical") pool = [...technical, ...behavioral, ...closers];
  else pool = [behavioral[0], technical[0], behavioral[1], technical[1], behavioral[2], technical[2], behavioral[3], technical[4], ...closers];
  return pool.slice(0, state.count);
}

function lowerFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1).replace(/\.$/, "");
}

function analyzeResume() {
  const resume = $("#resumeText").value.trim();
  const role = $("#targetRole").value.trim();
  if (!resume || resume.length < 80) {
    $("#formError").textContent = "Add a little more resume detail so we can create useful questions.";
    return;
  }
  if (!role) {
    $("#formError").textContent = "Add the role you're preparing for.";
    return;
  }

  $("#formError").textContent = "";
  state.resume = resume;
  state.role = role;
  state.company = $("#targetCompany").value.trim();
  state.count = Number($("#questionCount").value);
  state.profile = parseResume(resume);
  state.questions = generateQuestions(state.profile);
  populateReview();
  showView("review");
}

function populateReview() {
  const { profile } = state;
  const initials = profile.name.split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();
  $("#profileMonogram").textContent = initials;
  $("#profileName").textContent = profile.name;
  $("#profileTitle").textContent = profile.title;
  $("#experienceYears").textContent = profile.years;
  $("#reviewRole").textContent = state.role;
  $("#skillsList").innerHTML = profile.skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("");
  $("#highlightsList").innerHTML = profile.highlights.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  $("#focusSummary").textContent = `We'll explore your ${profile.skills.slice(0, 2).join(" and ").toLowerCase()}, measurable impact, collaboration, and readiness for a ${state.role} role.`;
  $("#questionPreview").textContent = state.questions[1]?.text || state.questions[0].text;
  $("#styleTag").textContent = state.style[0].toUpperCase() + state.style.slice(1);
}

function startInterview() {
  state.current = 0;
  state.answers = [];
  state.startedAt = Date.now();
  $("#interviewRoleLabel").textContent = state.role;
  renderQuestion();
  clearInterval(state.timerId);
  state.timerId = setInterval(updateTimer, 1000);
  showView("interview");
  $("#answerText").focus();
}

function updateTimer() {
  const seconds = Math.floor((Date.now() - state.startedAt) / 1000);
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  $("#interviewTimer").textContent = `${mins}:${secs}`;
}

function renderQuestion() {
  const question = state.questions[state.current];
  $("#questionType").textContent = question.type;
  $("#currentQuestion").textContent = question.text;
  $("#questionProgress").textContent = `Question ${state.current + 1} of ${state.questions.length}`;
  $("#answerText").value = "";
  $("#wordCount").textContent = "0 words";
  $("#questionDots").innerHTML = state.questions.map((_, index) =>
    `<span class="${index === state.current ? "current" : index < state.current ? "done" : ""}"></span>`
  ).join("");
}

function submitCurrentAnswer(skipped = false) {
  const answer = skipped ? "" : $("#answerText").value.trim();
  if (!skipped && answer.length < 15) {
    $("#answerText").focus();
    $("#answerText").style.borderColor = "#ed725b";
    setTimeout(() => $("#answerText").style.borderColor = "", 900);
    return;
  }
  state.answers.push(answer);
  if (state.current < state.questions.length - 1) {
    state.current++;
    renderQuestion();
    $("#answerText").focus();
  } else {
    clearInterval(state.timerId);
    buildReport();
    showView("report");
  }
}

function scoreAnswer(answer) {
  if (!answer) return { score: 35, clarity: 40, specificity: 25, structure: 35 };
  const words = answer.split(/\s+/).filter(Boolean);
  const hasNumbers = /\b\d+[%+$]?|\b(one|two|three|four|five)\b/i.test(answer);
  const hasAction = /\b(I|my|led|created|built|decided|analyzed|designed|implemented|recommended)\b/i.test(answer);
  const hasResult = /\b(result|outcome|impact|increased|reduced|improved|learned|grew|saved|delivered)\b/i.test(answer);
  const hasStructure = /\b(situation|task|first|then|because|ultimately|finally|result)\b/i.test(answer);
  const lengthScore = Math.min(35, Math.round(words.length / 3.2));
  const base = 35 + lengthScore;
  return {
    score: Math.min(96, base + (hasNumbers ? 8 : 0) + (hasAction ? 7 : 0) + (hasResult ? 8 : 0) + (hasStructure ? 5 : 0)),
    clarity: Math.min(95, 52 + Math.min(28, words.length / 3) + (hasStructure ? 10 : 0)),
    specificity: Math.min(96, 42 + (hasNumbers ? 25 : 0) + (hasAction ? 12 : 0) + (hasResult ? 10 : 0)),
    structure: Math.min(95, 48 + (hasStructure ? 25 : 0) + (hasAction ? 9 : 0) + (hasResult ? 10 : 0))
  };
}

function average(values) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function buildReport() {
  const scores = state.answers.map(scoreAnswer);
  const overall = average(scores.map(item => item.score));
  const clarity = average(scores.map(item => item.clarity));
  const specificity = average(scores.map(item => item.specificity));
  const structure = average(scores.map(item => item.structure));
  const answered = state.answers.filter(Boolean).length;

  $("#overallScore").textContent = overall;
  $("#clarityScore").textContent = clarity;
  $("#specificityScore").textContent = specificity;
  $("#structureScore").textContent = structure;
  $("#scoreRing").style.setProperty("--score", `${overall}%`);
  $$(".metric-bar")[0].querySelector("i").style.setProperty("--score", `${clarity}%`);
  $$(".metric-bar")[1].querySelector("i").style.setProperty("--score", `${specificity}%`);
  $$(".metric-bar")[2].querySelector("i").style.setProperty("--score", `${structure}%`);
  $("#scoreLabel").textContent = overall >= 85 ? "Standout performance" : overall >= 70 ? "Interview ready" : "Building momentum";
  $("#reportSubtitle").textContent = `${answered} of ${state.questions.length} questions answered · Tailored for ${state.role}`;

  const strengths = [];
  if (clarity >= 70) strengths.push("Your answers were generally clear and easy to follow.");
  if (structure >= 70) strengths.push("You connected context, action, and outcomes in a logical sequence.");
  if (state.answers.some(answer => /\bI\b/.test(answer))) strengths.push("You made your own contribution visible instead of hiding behind “we.”");
  if (state.answers.some(answer => /\d/.test(answer))) strengths.push("You used measurable evidence to make at least one story more credible.");
  strengths.push(`Your examples showed relevant experience for a ${state.role} position.`);

  const improvements = [];
  if (specificity < 80) improvements.push("Add numbers, constraints, and before-and-after context to make results concrete.");
  if (structure < 78) improvements.push("Use a simple Situation → Action → Result arc to keep longer answers focused.");
  if (state.answers.some(answer => answer && answer.split(/\s+/).length < 45)) improvements.push("Develop short answers with one more layer of detail: the decision, the alternative, and the result.");
  if (state.answers.some(answer => !answer)) improvements.push("Return to skipped questions; complete coverage builds confidence under pressure.");
  improvements.push("End each story by connecting what you learned to the needs of the target role.");

  $("#strengthsList").innerHTML = strengths.slice(0, 4).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  $("#improvementsList").innerHTML = improvements.slice(0, 4).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  $("#answerReviewList").innerHTML = state.questions.map((question, index) => {
    const score = scores[index].score;
    const answer = state.answers[index];
    const note = !answer ? "Skipped — revisit this question in your next practice." :
      score >= 80 ? "Strong evidence and a convincing level of detail." :
      score >= 65 ? "Solid answer; strengthen it with a more explicit result." :
      "Add a specific example and clarify your personal contribution.";
    return `<div class="answer-review-item">
      <span class="answer-index">${index + 1}</span>
      <div><h4>${escapeHtml(question.text)}</h4><p>${escapeHtml(note)}</p></div>
      <span class="answer-score">${score}</span>
    </div>`;
  }).join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

$("#heroStart").addEventListener("click", openApp);
$("#headerStart").addEventListener("click", openApp);
$("#closeApp").addEventListener("click", closeApp);
$("#appHome").addEventListener("click", event => { event.preventDefault(); closeApp(); });
$$("[data-scroll]").forEach(button => button.addEventListener("click", () => {
  document.getElementById(button.dataset.scroll).scrollIntoView({ behavior: "smooth" });
}));

$$(".style-card").forEach(card => card.addEventListener("click", () => {
  $$(".style-card").forEach(item => item.classList.remove("selected"));
  card.classList.add("selected");
  state.style = card.dataset.style;
}));

$("#sampleResume").addEventListener("click", () => {
  $("#resumeText").value = sampleResumeText;
  $("#targetRole").value = "Senior Product Designer";
  $("#targetCompany").value = "Growth-stage technology company";
  $("#fileStatus").textContent = "Sample resume loaded — ready to analyze.";
});

$("#resumeFile").addEventListener("change", event => {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    $("#fileStatus").textContent = "That file is over 5 MB. Try a smaller file or paste the text.";
    return;
  }
  if (file.type === "text/plain" || /\.(txt|md)$/i.test(file.name)) {
    const reader = new FileReader();
    reader.onload = () => {
      $("#resumeText").value = reader.result;
      $("#fileStatus").textContent = `${file.name} loaded successfully.`;
    };
    reader.readAsText(file);
  } else {
    $("#fileStatus").textContent = `${file.name} selected. For this local demo, paste PDF text below.`;
  }
});

const uploadZone = $(".upload-zone");
["dragenter", "dragover"].forEach(type => uploadZone.addEventListener(type, event => {
  event.preventDefault();
  uploadZone.classList.add("dragging");
}));
["dragleave", "drop"].forEach(type => uploadZone.addEventListener(type, event => {
  event.preventDefault();
  uploadZone.classList.remove("dragging");
}));
uploadZone.addEventListener("drop", event => {
  const file = event.dataTransfer.files[0];
  if (file && (file.type === "text/plain" || /\.(txt|md)$/i.test(file.name))) {
    const reader = new FileReader();
    reader.onload = () => {
      $("#resumeText").value = reader.result;
      $("#fileStatus").textContent = `${file.name} loaded successfully.`;
    };
    reader.readAsText(file);
  } else if (file) {
    $("#fileStatus").textContent = `${file.name} selected. For this local demo, paste PDF text below.`;
  }
});

$("#analyzeButton").addEventListener("click", analyzeResume);
$("#backToSetup").addEventListener("click", () => showView("setup"));
$("#beginInterview").addEventListener("click", startInterview);
$("#answerText").addEventListener("input", event => {
  const count = event.target.value.trim() ? event.target.value.trim().split(/\s+/).length : 0;
  $("#wordCount").textContent = `${count} word${count === 1 ? "" : "s"}`;
});
$("#submitAnswer").addEventListener("click", () => submitCurrentAnswer(false));
$("#skipQuestion").addEventListener("click", () => submitCurrentAnswer(true));
$("#restartInterview").addEventListener("click", startInterview);

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && $("#appShell").classList.contains("open")) closeApp();
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && $("#interviewView").classList.contains("active")) {
    submitCurrentAnswer(false);
  }
});
