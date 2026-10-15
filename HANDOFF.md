# HANDOFF.md — Student Drive Academic Portal (DYP DPU)

## 1. Project Goal & Current Scope
- **Goal:** Develop the Google Stitch academic portal export into a responsive, university-grade "Student Drive" web application where students can track course assignments, upload project files, and review revision feedback, and faculty can inspect submitted artifacts, score rubrics, and approve or request changes.
- **Current Scope:**
  - A fully functional, responsive Single Page Application (SPA) with client-side hash routing (`#/login`, `#/student-dashboard`, `#/subject-and-assignments`, `#/assignment-upload`, `#/student-submission`, `#/teacher-dashboard`, `#/teacher-review`).
  - Updated standalone Stitch screen templates in `stitch_student_drive_academic_portal/` with full theme parity and cross-navigation.
  - Frontend reads and writes through `/api`; local mode persists records in `data/student_drive_db.json` and AWS mode uses the DynamoDB adapter.
  - Zero remaining prototype blue branding; fully converted to the college's Maroon, White, and Gold design system.
  - AWS mode can sign private S3 uploads and validate Cognito ID tokens when configured. This workspace has not been connected to or verified against an AWS account.

---

## 2. Framework, App Folder & Commands

- **Framework:** Pure HTML5 + Vanilla JavaScript + Tailwind CSS (via Tailwind CDN with custom Material Design 3 tokens) + Google Fonts (*Inter*, *Material Symbols Outlined*). No heavy frontend build framework is required.
- **App Folder:** 
  - Root entry point: [`index.html`](file:///d:/Users/mayur/Desktop/Cloud-Computing-Mini-Project/index.html)
  - Stitch screen export templates: [`stitch_student_drive_academic_portal/`](file:///d:/Users/mayur/Desktop/Cloud-Computing-Mini-Project/stitch_student_drive_academic_portal)
  - Assets: [`public/images/`](file:///d:/Users/mayur/Desktop/Cloud-Computing-Mini-Project/public/images)
- **Install Command:**
  ```bash
  # No external npm packages are strictly required; standard Node.js runtime is sufficient
  npm install # (optional / no dependencies needed)
  ```
- **Run Command:**
  ```bash
  # Option A (Native Node server):
  npm start
  # or
  npm run dev
  # or
  node server.js

  # Option B (Any static HTTP server):
  npx serve .
  ```
  App runs locally at: **`http://localhost:3000`**
- **Build Command:**
  Not applicable (static frontend without bundling). Direct file serving via Node.js or any static file host (e.g. AWS S3 + CloudFront).

---

## 3. Current Folder Structure & Key Entry Points

```
Cloud-Computing-Mini-Project/
├── HANDOFF.md                                    # This engineering handoff document
├── README.md                                     # Project overview and AWS architecture docs
├── package.json                                  # NPM start/dev scripts and project metadata
├── server.js                                     # Zero-dependency Node.js HTTP static server (port 3000)
├── index.html                                    # Primary responsive SPA combining all 7 screens & state
├── update_stitch_screens.js                      # Maintenance script to sync tokens across stitch screens
├── public/
│   └── images/
│       ├── logo.png                              # Official DYP DPU college logo (maroon & gold)
│       ├── image-1.jpg                           # University classroom hall lecture photograph
│       ├── image-2.jpg                           # Faculty whiteboard lecture photo (Dr. Evelyn Reed)
│       └── image-3.webp                          # Student studying with textbooks and laptop
└── stitch_student_drive_academic_portal/
    ├── student_drive/
    │   └── DESIGN.md                             # Design token specification (Maroon, White & Gold)
    ├── 1._login_desktop/code.html                # Screen 1: Login & Role Selection
    ├── 2._student_dashboard_desktop/code.html    # Screen 2: Student Dashboard & KPI Metrics
    ├── 3._subject_and_assignments_desktop/code.html # Screen 3: CS-601 Subject & Assignment List
    ├── 4._assignment_upload_page_desktop/code.html  # Screen 4: Assignment Upload & S3 Dropzone
    ├── 5._student_submission_details_desktop/code.html # Screen 5: Submission Details & Revision Feedback
    ├── 6._teacher_dashboard_desktop/code.html    # Screen 6: Teacher Dashboard & Review Queue
    └── 7._teacher_review_page_desktop/code.html  # Screen 7: Teacher Review Workspace & Grading Rubric
```

---

## 4. Design & Branding Requirements

- **Color Architecture (100% Blue Eliminated):**
  - **Maroon (Primary & Structural Authority):** Deep academic maroon (`#800020`, container `#941B31`, active states `#68051E`, on-container `#FFF0F2`). Used for sidebar branding, primary buttons, active link indicators, and high-priority revision banners.
  - **White & Warm Off-White (Canvas & Cards):** Pure white (`#FFFFFF`) card surfaces and warm off-white canvas (`#FCF9F9`, surface-container `#F4EBEC`) for readability.
  - **Gold (Restrained Accent):** College gold (`#C59B27`, badge fill `#FEF7DE`, border `#EDD084`). High-contrast dark amber text (`#6D4B18` / `#845E17`) is enforced on light gold surfaces to maintain WCAG AAA contrast (no faint yellow on white).
- **Use of Local Assets in `public/images/`:**
  - `logo.png`: Rendered in the sign-in form header, the top app bar, and the persistent desktop/mobile sidebars with "DYP DPU Portal" branding.
  - `image-1.jpg`: Rendered on the login page's left atmospheric campus showcase column behind a maroon scrim.
  - `image-2.jpg`: Rendered for Dr. Evelyn Reed's instructor headshot in the CS-601 subject view and teacher dashboard banner.
  - `image-3.webp`: Used for student study context and submission materials.
  - Zero remote image URLs are used; all assets are strictly referenced via local paths.

---

## 5. Features Completed & How to Use Them

1. **Role-Based Authentication (`#/login`):**
   - Click "Student" or "Faculty / Teacher" tabs.
   - Use the **Quick Demo Credentials** buttons:
     - `Alex Chen (Student)`: Sets ID `CS-2023-084`
     - `Dr. Evelyn Reed (Teacher)`: Sets ID `FAC-CSE-042`
   - Click "Sign in" to land on the respective dashboard.
2. **Student Dashboard (`#/student-dashboard`):**
   - Displays academic metrics (GPA 3.84, attendance 94.2%, credits 92/120).
   - 3 interactive KPI cards (Due Soon, Submitted, Action Needed).
   - High-priority revision alert banner with direct "Inspect Feedback & Resubmit" button.
   - Course cards and recent submission tracking table.
3. **Subject View (`#/subject-and-assignments`):**
   - Displays Computer Networks (CS-601) course specifications and Dr. Reed's instructor card.
   - "Download Syllabus" button triggers a simulated verified PDF download toast.
   - Filterable assignment list with direct action buttons based on assignment status.
4. **Assignment Upload Form (`#/assignment-upload`):**
   - Drag-and-drop or click to browse files (`.zip`, `.tar.gz`, `.pdf`, `.py`).
   - Validates file selection, updates UI with file name and size, and provides a clear button.
   - Select submission target version (`v1.0` or `v1.1`) and add optional student comments.
   - "Submit Assignment" triggers an animated chunk-streaming progress bar (0% → 100%) and appends the new submission to shared state.
5. **Student Submission Details (`#/student-submission`):**
   - Displays live submission status, Dr. Evelyn Reed's revision commentary, rubric point breakdown (77/100), and revision timeline.
   - "Download Submitted Archive" button simulates pre-signed GET verification.
6. **Teacher Dashboard (`#/teacher-dashboard`):**
   - Displays Dr. Evelyn Reed's faculty banner, office hours status, and review KPIs.
   - Search input (searches student name, roll number, assignment title) with course and status dropdown filters.
   - Submissions queue table with an "Evaluate" button on each row.
7. **Teacher Grading Workspace (`#/teacher-review`):**
   - Submission artifact inspection with S3 key, SHA-256 validation tag, and syntax-highlighted code viewer (`server_socket_echo.py`).
   - Interactive rubric sliders (Correctness, Modularity, Tests, Docs) that dynamically recalculate the total score /100.
   - Editable feedback textarea.
   - Functional **"Request Changes"** and **"Approve & Record"** buttons that persist review records through the backend API.
8. **Responsive Navigation & Role Switcher:**
   - Click the role switch icon in the top header or sidebar to hot-swap between Alex Chen (Student) and Dr. Evelyn Reed (Teacher) at any time.
   - Hamburger drawer menu for viewport widths under 1024px.
9. **Backend persistence:**
   - `backend/storage/local-store.js` provides persistent local JSON storage; `backend/storage/dynamodb-store.js` provides a single-table DynamoDB adapter with GSIs.
   - API entities are normalized into the existing Stitch UI model so stored submissions can be opened and reviewed.

---

## 6. Features Still Missing or Simulated (Demo Sandbox)

- **Authentication:** The login UI remains a demo selector. Local mode trusts demo identity headers and must not be exposed as production authentication. AWS auth mode verifies Cognito ID-token signatures and requires a matching portal user record.
- **S3 in local mode:** File bytes go to the local mock endpoint and are not retained as files. AWS mode uses pre-signed PUT URLs when AWS credentials and bucket permissions are configured.
- **Simulated Downloads:** Syllabus and submission downloads verify permissions and show toast notifications rather than downloading actual binary blobs.
- **State Storage:** Local API records persist in `data/student_drive_db.json`; `localStorage` is only the frontend cache. DynamoDB mode has not been exercised against a live AWS table in this workspace.

---

## 7. Current Errors or Blockers

- AWS resources and Cognito settings are not configured here. Do not treat the UI's AWS status badge as proof of a successful live integration; API data sync must succeed too.
- The demo sign-in screen has not been replaced with Cognito sign-in. In `AUTH_MODE=cognito`, callers need a valid Cognito ID token and a matching portal user record.
- Downloads are still presentation-only. Local mock uploads count bytes but do not retain the uploaded file.

---

## 8. Important Implementation Decisions & Environment Variables

- **Zero-Dependency Server:** Standard `node:http` and `node:fs` were chosen for `server.js` so any developer or automated agent can immediately run the application without running `npm install`.
- **Hybrid Architecture:** Both a single-page interactive portal (`index.html`) AND updated standalone Stitch templates (`stitch_student_drive_academic_portal/*/code.html`) are maintained so the repository functions seamlessly whether opened directly by file or served over HTTP.
- **No Secrets in Code:** In strict adherence to security guidelines, no AWS access keys, secret keys, or bucket ARNs are embedded in the frontend code.
- **Environment Variables:**
  - `PORT`: Optional port override for local server (defaults to `3000`).
  - `AWS_REGION`: Target region for Cognito and S3 (e.g. `ap-south-1` or `us-east-1`).
  - `COGNITO_USER_POOL_ID`: User Pool ID used by backend ID-token verification.
  - `COGNITO_CLIENT_ID`: App client ID accepted by backend ID-token verification.
  - `S3_BUCKET`: Target private S3 bucket (default `student-drive-assignments-dyp-dpu`).
  - `AUTH_MODE`: `cognito` for verified Cognito tokens; defaults to `demo` with local/DynamoDB Local storage and `cognito` for AWS storage.

---

## 9. Next 3–5 Concrete Tasks (In Priority Order)

1. **Connect AWS resources:** Provision `StudentDrive_Main` with `scripts/setup-dynamodb.js`, configure a private S3 bucket and its CORS policy, then use an IAM role scoped to the table and bucket.
2. **Complete Cognito sign-in:** Replace demo login and identity headers with Cognito sign-in that sends a verified ID token; map Cognito identities to seeded portal users and roles.
3. **Validate cloud flows:** Check DynamoDB reads/writes, S3 upload and failure handling, and teacher review against a non-production AWS environment before describing these as live.
4. **Add real file retrieval:** Use an authenticated backend route to issue short-lived S3 GET links for syllabus and submission downloads.
5. **Improve assignment and roster management:** Add enrollment checks and teacher-facing assignment creation backed by the existing API.
