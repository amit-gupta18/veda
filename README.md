# AI Assessment Extraction & Answer Mapping

A teacher uploads a question paper and a student's handwritten answer sheet (PDF or images). The app
extracts every question (splitting labelled sub-parts like `11(a)`/`11(b)` into separate entries), extracts
every answer, maps answers to questions, highlights the exact answer region on the sheet when a question is
clicked, and grades each answer with AI feedback.

## Architecture

- **Frontend**: Next.js (App Router, TypeScript), deployed to Vercel.
- **Backend**: Express + TypeScript, deployed to Render. Folder layout mimics NestJS's feature-module
  convention (`questions/`, `answers/`, `mapping/`, `grading/`, each with `*.controller.ts` / `*.service.ts` /
  `*.module.ts`) even though it's plain Express, for clearer separation of concerns.
- **No database** -- an in-memory session store (`backend/src/common/session-store.ts`) holds each
  session's page images and extracted data for the process lifetime.
- **CORS**: fully open (`app.use(cors())`) with no origin/method/header restrictions.

## Pipeline

1. `POST /api/questions/extract` -- rasterizes the question paper (PDF pages -> PNG via `pdfjs-dist` +
   `@napi-rs/canvas`) and calls OpenAI vision **once per page** to extract questions in printed order,
   splitting sub-parts and preserving original numbering.
2. `POST /api/answers/extract` -- same rasterization for the answer sheet; OpenAI vision extracts each
   handwritten answer block per page along with a normalized bounding box `{x,y,w,h}` and any label the
   student wrote. A lightweight continuation heuristic stitches answers that span multiple pages into one
   entry with multiple regions.
3. `POST /api/map` -- matches answer regions to questions: first by explicit label (regex-normalized,
   order-independent so out-of-order answers still match), then a semantic fallback (a second OpenAI text
   call) for unlabeled answers against unmatched questions. Anything left over is reported as
   `unmatchedAnswerIds` rather than silently dropped; anything with no match is `unanswered`.
4. `POST /api/grade` -- grades each mapped answer (correct/incorrect, marks, short feedback) plus an overall
   summary.

The frontend calls these four endpoints sequentially, showing real per-stage progress, then renders a
split-screen view: question list on the left (with Answered / Not answered / Inferred-match badges),
answer-sheet viewer on the right with bounding-box overlays, and a grading panel. Clicking a question jumps
the viewer to the right page(s) and highlights the matching region(s); unmatched answers are listed
separately and are also clickable.

## AI model

**OpenAI `gpt-4o-mini`** (vision + text), chosen for its free-tier availability and native multimodal
support for both printed-text OCR (question paper) and handwriting transcription (answer sheet), including
returning normalized bounding-box coordinates for highlighting.

Each page is sent to the model as its own request (rather than batching a whole document into one call).
This keeps token cost per request small and predictable regardless of document length or source-scan
resolution -- important on lower-tier accounts where a single oversized request can exceed the
per-request token cap outright. Requests are paced (~4.5s apart) and retried with backoff on transient
429s; a 429 that indicates an exhausted **daily** quota fails fast with a clear error instead of blocking
on OpenAI's suggested (potentially 20+ minute) retry window.

## Assumptions & limitations

- Every image sent to the model is downscaled to a 1536px longest edge to keep vision-token cost bounded;
  this is generally sufficient for legible handwriting but very small or dense handwriting may transcribe
  less accurately than at full native resolution.
- Multi-page answer continuation is a heuristic (the model flags "this looks like it continues from the
  previous page"), not a guarantee -- it can occasionally split or merge answers incorrectly across a page
  boundary.
- Semantic (unlabeled) answer-to-question matching is best-effort AI judgment, surfaced in the UI as
  "Inferred match" with a confidence score, distinct from confident label-based matches.
- Free/low-tier OpenAI accounts can have very low per-minute/per-day request caps (observed as low as 3-10
  RPM and 50 requests/day on `gpt-4o`/`gpt-4o-mini` respectively without a payment method attached) --
  processing a multi-page document can take one to a few minutes under those caps, and heavy testing in a
  single day can exhaust the daily quota. A production deployment should use a key with billing enabled.
- No authentication and no persistent database, per assignment scope -- sessions live in memory only and
  are lost on server restart.

## Local development

**Backend**
```
cd backend
cp .env.example .env   # fill in OPENAI_API_KEY
npm install
npm run dev            # http://localhost:4000
```

**Frontend**
```
cd frontend
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev             # http://localhost:3000
```

## Deployment

- **Frontend (Vercel)**: import the `frontend/` directory as the project root; set `NEXT_PUBLIC_API_URL` to
  the deployed backend URL.
- **Backend (Render)**: root directory `backend/`; build command `npm install && npm run build`; start
  command `npm start`; set `OPENAI_API_KEY` and `OPENAI_MODEL` (defaults to `gpt-4o-mini`) as environment
  variables. Render supplies `PORT` automatically.
