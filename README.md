# Student Drive: Academic Assignment & Grading Portal (DYP DPU)

A responsive, university-grade academic portal developed from the Google Stitch prototype for students to submit coursework and faculty to evaluate and grade submissions.

---

## 🏫 College Branding & Color Architecture

The entire portal has been tailored to the college’s authoritative **Maroon, White, and Gold** color system with zero remaining blue prototype styles:

- **Primary Actions & Nav Header:** Deep Academic Maroon (`#800020`, container `#941B31`)
- **Canvas & Card Surfaces:** Pure White (`#FFFFFF`) and warm ivory/off-white (`#FCF9F9`)
- **Restrained Accents & Badges:** College Gold (`#C59B27`, badge `#FEF7DE`, text contrast `#6D4B18` / `#845E17`)
- **High-Contrast Text:** Dark Slate-Maroon (`#1F1617`, variant `#544648`)
- **Local Assets Utilized (`public/images/`):**
  - `logo.png`: Official DYP DPU college insignia featured in login, navigation, and sidebar branding.
  - `image-1.jpg`: University classroom lecture photo used in the login portal background scrim.
  - `image-2.jpg`: Faculty teaching photo used in Dr. Evelyn Reed's instructor cards and teacher workspace banner.
  - `image-3.webp`: Student coursework studying photo used in student workspace context.

---

## 🚀 How to Run the Application

The project includes both a standalone zero-dependency Node server and full static web support.

### Option 1: Using Node.js (Recommended)
Run from the project root:
```bash
npm start
# or
npm run dev
# or
node server.js
```
Then open your browser at **[http://localhost:3000](http://localhost:3000)**.

### Option 2: Using Any Static Server
```bash
npx serve .
```

### Option 3: Direct File System Access
You can also directly open `index.html` or any individual screen in `stitch_student_drive_academic_portal/` in any modern web browser.

---

## 📱 Implemented Frontend Flows (With Realistic Sample Data)

1. **Student & Teacher Sign-in (`#/login`)**:
   - Clear role distinction with segmented tabs: Student vs. Faculty / Teacher.
   - Quick one-click demo credentials for **Alex Chen (Student)** and **Dr. Evelyn Reed (Teacher)**.
   - Simulated 2FA active badge and University SSO button.
2. **Student Dashboard (`#/student-dashboard`)**:
   - Personalized greeting, student credentials (`CS-2023-084`), GPA, and attendance metrics.
   - Key KPI metric cards: *Due Soon (2)*, *Submitted (14)*, and *Action Needed (1)*.
   - Urgent Revision Alert banner with one-click navigation to resolve feedback.
   - Enrolled subject cards and recent submission tracking table.
3. **Subject Page (`#/subject-and-assignments`)**:
   - Computer Networks (`CS-601`) overview with credit breakdown and schedule info.
   - Syllabus download simulation (verifies file download toast).
   - Lead instructor card with Dr. Evelyn Reed's local photo (`image-2.jpg`).
   - Assignment filter pills and interactive assignment status cards.
4. **Assignment Upload Form (`#/assignment-upload`)**:
   - Task specification brief and countdown timer.
   - Drag-and-drop file picker supporting `.zip`, `.tar.gz`, `.pdf`, `.py`.
   - File size, name display, and format validation.
   - Student changelog / comments textarea and version target selector (`v1.0` vs. `v1.1`).
   - Simulated AWS S3 pre-signed upload progress bar with status updates.
5. **Student Submission Details (`#/student-submission`)**:
   - Status banner reflecting instructor review status.
   - Instructor feedback card quoting specific code flaws and revision guidance.
   - Rubric score breakdown across 4 criteria (Correctness, Modularity, Tests, Docs).
   - Version revision timeline (`v1.0` and `v1.1`) and archive download button.
6. **Teacher Dashboard (`#/teacher-dashboard`)**:
   - Faculty header for Dr. Evelyn Reed with office hours indicator.
   - 3 Stat KPI cards: Review Queue, Turnaround Time, and Graded Milestones.
   - Search filter by student name / roll number, course dropdown, and status filter pills.
   - Interactive review queue table with direct "Evaluate" links.
7. **Teacher Review Page (`#/teacher-review`)**:
   - Dual-pane layout: submitted file artifact details, S3 checksum, and interactive code viewer (`server_socket_echo.py`).
   - Interactive rubric scoring sliders with automatic total score calculation out of 100.
   - Editable faculty feedback textarea.
   - Functional **"Request Changes"** and **"Approve & Record"** buttons that immediately update shared state across the portal.

---

## 🔒 Security & AWS Integration Architecture

The project includes a backend API with local JSON persistence and optional DynamoDB/S3 adapters. It contains no hardcoded AWS secrets. Local mode is a demo; AWS mode requires configured resources and has not been verified against a live AWS account from this workspace.

### Backend storage modes
- By default, `npm start` uses the local persistent JSON database at `data/student_drive_db.json` and a local mock upload endpoint.
- Set `STORAGE_MODE=aws`, `AWS_REGION`, `DYNAMODB_TABLE`, and `S3_BUCKET` to select AWS services. Configure AWS credentials through the standard AWS SDK credential chain; never place keys in frontend code.
- AWS mode defaults to Cognito ID-token verification. Set `COGNITO_USER_POOL_ID` and `COGNITO_CLIENT_ID`, replace the demo login with Cognito sign-in, and provision matching portal user records before using it.
- For DynamoDB Local, set `DYNAMODB_ENDPOINT` (and optionally `S3_ENDPOINT` for an S3-compatible service); the app uses demo authentication unless `AUTH_MODE` is explicitly set to `cognito`.
- `node scripts/setup-dynamodb.js` creates the single-table design and seeds sample records. Review the script and target account before running it.

To connect this application to real AWS production infrastructure:

### 1. Authentication (AWS Cognito)
- **User Pool & App Client:** Create a Cognito User Pool with custom attributes (`custom:roll_number`, `custom:role`).
- **Cognito Groups:** Define `Students` and `Faculty` IAM groups for role-based access control (RBAC).
- **JWT Verification:** Frontend authenticates against Cognito via AWS Amplify SDK or OAuth2 / OpenID Connect, receiving an `id_token` and `access_token`.

### 2. Private S3 Uploads (Pre-Signed URLs)
- **Private S3 Bucket:** Configure an encrypted Amazon S3 bucket (`s3://student-drive-assignments-dyp-dpu`) with **Block All Public Access** enabled and SSE-KMS encryption.
- **Pre-Signed URL Generator:** Lambda function behind API Gateway validates student authentication, ensures file format and size (<25 MB), and generates a pre-signed S3 `PUT` URL valid for 15 minutes.
- **Direct Upload:** Frontend uploads file bytes directly to the pre-signed URL via `fetch(presignedUrl, { method: 'PUT', body: file })`, keeping application servers stateless.

### 3. Submission & Feedback Persistence (Amazon DynamoDB)
- **DynamoDB Tables:**
  - `Submissions`: `PK: assignment_id`, `SK: student_id#version`, with attributes `s3_key`, `status`, `scores`, `feedback`, `timestamp`.
  - `Courses`: Course metadata, syllabus S3 key, and enrolled student rosters.
- **Audit Trails:** Amazon S3 Event Notifications trigger a Lambda function to record file checksums and timestamp records upon successful upload.
