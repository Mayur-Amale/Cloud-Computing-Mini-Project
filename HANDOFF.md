# HANDOFF.md — Student Drive Academic Portal (DYP DPU)

## 1. Project Goal & Current Scope
- **Goal:** Develop the Google Stitch academic portal export into a responsive, university-grade "Student Drive" web application where students can track course assignments, upload project files, and review revision feedback, and faculty can inspect submitted artifacts, score rubrics, and approve or request changes.
- **Current Scope:**
  - A fully functional, responsive Single Page Application (SPA) with client-side hash routing (`#/login`, `#/student-dashboard`, `#/subject-and-assignments`, `#/assignment-upload`, `#/student-submission`, `#/teacher-dashboard`, `#/teacher-review`).
  - Updated standalone Stitch screen templates in `stitch_student_drive_academic_portal/` with full theme parity and cross-navigation.
  - Realistic mock data and state persistence via browser `localStorage`.
  - Zero remaining prototype blue branding; fully converted to the college's Maroon, White, and Gold design system.
  - Preparation for real AWS cloud services (Cognito, private S3 pre-signed uploads, DynamoDB).

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
   - Functional **"Request Changes"** and **"Approve & Record"** buttons that immediately mutate the submission in `localStorage` and trigger instant toast notifications.
8. **Responsive Navigation & Role Switcher:**
   - Click the role switch icon in the top header or sidebar to hot-swap between Alex Chen (Student) and Dr. Evelyn Reed (Teacher) at any time.
   - Hamburger drawer menu for viewport widths under 1024px.

---

## 6. Features Still Missing or Simulated (Demo Sandbox)

- **Simulated Authentication:** Login validates form inputs and sets role state in memory/localStorage without contacting AWS Cognito.
- **Simulated S3 Uploads:** File bytes are validated in the browser; the upload progress bar simulates pre-signed PUT streaming. Files are not sent to an active AWS S3 bucket.
- **Simulated Downloads:** Syllabus and submission downloads verify permissions and show toast notifications rather than downloading actual binary blobs.
- **State Storage:** Shared portal state persists in browser `localStorage`. Resetting browser data restores the default sample data.

---

## 7. Current Errors or Blockers

- **None.** The Node server runs without errors (`node server.js`), all screens render with zero CSS/JS console errors, all 7 flows navigate cleanly, and browser subagent verification tests passed successfully.

---

## 8. Important Implementation Decisions & Environment Variables

- **Zero-Dependency Server:** Standard `node:http` and `node:fs` were chosen for `server.js` so any developer or automated agent can immediately run the application without running `npm install`.
- **Hybrid Architecture:** Both a single-page interactive portal (`index.html`) AND updated standalone Stitch templates (`stitch_student_drive_academic_portal/*/code.html`) are maintained so the repository functions seamlessly whether opened directly by file or served over HTTP.
- **No Secrets in Code:** In strict adherence to security guidelines, no AWS access keys, secret keys, or bucket ARNs are embedded in the frontend code.
- **Environment Variables (For Future Backend Hookup):**
  - `PORT`: Optional port override for local server (defaults to `3000`).
  - `AWS_REGION`: Target region for Cognito and S3 (e.g. `ap-south-1` or `us-east-1`).
  - `COGNITO_USER_POOL_ID`: Future Cognito User Pool ID.
  - `COGNITO_CLIENT_ID`: Future Cognito App Client ID.
  - `S3_BUCKET_NAME`: Target private S3 bucket name (e.g. `student-drive-assignments-dyp-dpu`).

---

## 9. Next 3–5 Concrete Tasks (In Priority Order)

1. **Deploy Frontend to AWS S3 & CloudFront:**
   - Create an automated script or CDK/Terraform stack to push `index.html`, `public/`, and `stitch_student_drive_academic_portal/` to an S3 bucket configured for static website hosting behind an Amazon CloudFront distribution with HTTPS.
2. **Implement Real AWS S3 Pre-Signed Upload Lambda:**
   - Write a Node.js/Python AWS Lambda function exposed via API Gateway that accepts `{ fileName, fileType, assignmentId, studentRoll }`, validates user authentication, and calls `s3.getSignedUrlPromise('putObject', ...)` with 15-minute expiration and max size constraints.
   - Update `submitAssignmentWork()` in `index.html` to fetch this pre-signed URL and execute `fetch(presignedUrl, { method: 'PUT', body: file })`.
3. **Configure AWS Cognito Authentication:**
   - Create an AWS Cognito User Pool with custom attributes (`custom:roll_no`, `custom:role`) and groups (`Students`, `Faculty`).
   - Integrate AWS Amplify Auth in `index.html` to swap out mock sign-in for real SRP/OAuth2 sign-in.
4. **Provision DynamoDB Submission & Rubric Tables:**
   - Create a DynamoDB table `StudentDrive_Submissions` (Partition Key: `assignment_id`, Sort Key: `student_id#version`).
   - Create CRUD API endpoints for fetching submissions, updating rubric scores, and recording teacher feedback.
5. **Add Client-Side File Extraction / Multi-File Previewer:**
   - Integrate JSZip in `#/teacher-review` to extract uploaded `.zip` archives directly in the browser so faculty can view all project files in a file-tree explorer without having to download the zip file locally.
