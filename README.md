# Prepwise

An AI resume-based mock interview experience built with plain HTML, CSS, and JavaScript.

## Run locally

Open `index.html` directly, or start a small local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Included

- Resume text and TXT/Markdown upload
- Local resume parsing for skills, experience, and measurable outcomes
- Role and interview-style customization
- Tailored behavioral and role-specific questions
- Timed written interview flow
- Per-answer scoring and coaching report
- Responsive design with no build step or external JavaScript dependencies

The current AI behavior is an in-browser heuristic demo. `parseResume`, `generateQuestions`, and `scoreAnswer` in `app.js` are the integration points for a production AI API.

# AI-MOCK-INTERVIEW-
