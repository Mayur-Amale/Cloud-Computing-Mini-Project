const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const config = require('../config');
const { getStorage } = require('../storage');
const { authenticate } = require('../auth/middleware');

// S3 Client configuration
let s3Client = null;
if (config.STORAGE_MODE === 'aws') {
  try {
    s3Client = new S3Client({
      region: config.AWS.REGION,
      ...(config.AWS.S3_ENDPOINT ? { endpoint: config.AWS.S3_ENDPOINT, forcePathStyle: true } : {})
    });
  } catch (err) {
    console.warn(`[S3] S3Client initialization warning:`, err.message);
  }
}

async function handleApiRequest(req, res, url) {
  const method = req.method.toUpperCase();
  const pathname = url.pathname;
  const storage = getStorage();

  // Helper JSON responders
  const sendJson = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    });
    res.end(JSON.stringify(data));
  };

  const sendError = (statusCode, message) => {
    sendJson(statusCode, { error: message, statusCode });
  };

  // CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-id, x-user-role',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    });
    res.end();
    return;
  }

  // Parse JSON Body for POST / PUT / PATCH
  const readBody = () => new Promise((resolve, reject) => {
    let bodyStr = '';
    req.on('data', chunk => {
      bodyStr += chunk;
      if (bodyStr.length > 50 * 1024 * 1024) { // 50MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!bodyStr) return resolve({});
      try {
        resolve(JSON.parse(bodyStr));
      } catch (e) {
        // Fallback for raw text / binary
        resolve(bodyStr);
      }
    });
    req.on('error', reject);
  });

  try {
    // -------------------------------------------------------------
    // Route: GET /api/health
    // -------------------------------------------------------------
    if (pathname === '/api/health' && method === 'GET') {
      return sendJson(200, {
        status: 'ok',
        storageMode: config.STORAGE_MODE,
        aws: {
          region: config.AWS.REGION,
          dynamoDbTable: config.AWS.DYNAMODB_TABLE,
          s3Bucket: config.AWS.S3_BUCKET,
          dynamoDbEndpoint: config.AWS.DYNAMODB_ENDPOINT || 'AWS Cloud Service'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Authenticate caller
    const user = await authenticate(req);

    // -------------------------------------------------------------
    // Route: GET /api/auth/me
    // -------------------------------------------------------------
    if (pathname === '/api/auth/me' && method === 'GET') {
      return sendJson(200, { user });
    }

    // -------------------------------------------------------------
    // Route: GET /api/subjects
    // -------------------------------------------------------------
    if (pathname === '/api/subjects' && method === 'GET') {
      const allSubjects = await storage.listSubjects();
      // Tag subjects taught by the teacher; return flat array for frontend
      const mapped = allSubjects.map(s => ({
        ...s,
        isInstructor: user.role === 'teacher' && s.instructorId === user.userId
      }));
      return sendJson(200, mapped);
    }

    // -------------------------------------------------------------
    // Route: GET /api/assignments
    // -------------------------------------------------------------
    if (pathname === '/api/assignments' && method === 'GET') {
      const subjectCode = url.searchParams.get('subjectCode');
      const assignments = await storage.listAssignments(subjectCode);
      return sendJson(200, assignments);
    }

    // -------------------------------------------------------------
    // Route: POST /api/assignments
    // Teacher only; must teach the subject
    // -------------------------------------------------------------
    if (pathname === '/api/assignments' && method === 'POST') {
      if (user.role !== 'teacher') {
        return sendError(403, 'Forbidden: Only faculty members can create assignments.');
      }

      const body = await readBody();
      if (!body.title || !body.subjectCode || !body.dueDate) {
        return sendError(400, 'Bad Request: Missing title, subjectCode, or dueDate.');
      }

      // Verify teacher teaches this subject
      const subject = await storage.getSubject(body.subjectCode);
      if (!subject) {
        return sendError(404, `Subject ${body.subjectCode} does not exist.`);
      }
      if (subject.instructorId !== user.userId) {
        return sendError(403, `Forbidden: You are not assigned to instruct ${body.subjectCode}.`);
      }

      const assignmentId = body.assignmentId || `asg-${Date.now().toString(36)}`;
      const newAssignment = await storage.createAssignment({
        assignmentId,
        subjectCode: body.subjectCode,
        title: body.title,
        brief: body.brief || '',
        requirements: body.requirements || [],
        dueDate: body.dueDate,
        maxScore: body.maxScore || 100,
        status: 'Upcoming',
        createdBy: user.userId,
        createdAt: new Date().toISOString()
      });

      return sendJson(201, { assignment: newAssignment });
    }

    // -------------------------------------------------------------
    // Route: GET /api/submissions
    // Role-enforced:
    // - Students can ONLY view their own submissions
    // - Teachers can ONLY view submissions for subjects they instruct
    // -------------------------------------------------------------
    if (pathname === '/api/submissions' && method === 'GET') {
      const statusFilter = url.searchParams.get('status');
      const subjectFilter = url.searchParams.get('subjectCode');

      let queryParams = { status: statusFilter };

      if (user.role === 'student') {
        // Enforce student ownership
        queryParams.studentId = user.userId;
      } else if (user.role === 'teacher') {
        // Enforce teacher subject assignment
        const taughtSubjects = await storage.listSubjects(user.userId);
        const taughtCodes = taughtSubjects.map(s => s.subjectCode);

        if (subjectFilter) {
          if (!taughtCodes.includes(subjectFilter)) {
            return sendError(403, `Forbidden: You do not teach subject ${subjectFilter}.`);
          }
          queryParams.subjectCodes = [subjectFilter];
        } else {
          queryParams.subjectCodes = taughtCodes;
        }
      } else {
        return sendError(403, 'Forbidden: Unknown user role.');
      }

      const submissions = await storage.listSubmissions(queryParams);
      return sendJson(200, submissions);
    }

    // -------------------------------------------------------------
    // Route: GET /api/submissions/:id
    // Role-enforced single submission inspection
    // -------------------------------------------------------------
    const subIdMatch = pathname.match(/^\/api\/submissions\/([a-zA-Z0-9_\-]+)$/);
    if (subIdMatch && method === 'GET') {
      const submissionId = subIdMatch[1];
      const submission = await storage.getSubmission(submissionId);

      if (!submission) {
        return sendError(404, `Submission ${submissionId} not found.`);
      }

      // Ownership and Role Check
      if (user.role === 'student' && submission.studentId !== user.userId) {
        return sendError(403, 'Forbidden: Students are restricted from accessing other students submissions.');
      }

      if (user.role === 'teacher') {
        const subject = await storage.getSubject(submission.subjectCode);
        if (!subject || subject.instructorId !== user.userId) {
          return sendError(403, `Forbidden: You are not authorized to inspect submissions for ${submission.subjectCode}.`);
        }
      }

      return sendJson(200, { submission });
    }

    // -------------------------------------------------------------
    // Route: POST /api/submissions
    // Students create submissions; stores S3 key & metadata
    // -------------------------------------------------------------
    if (pathname === '/api/submissions' && method === 'POST') {
      if (user.role !== 'student') {
        return sendError(403, 'Forbidden: Only students can submit assignments.');
      }

      const body = await readBody();
      if (!body.assignmentId || !body.fileName) {
        return sendError(400, 'Bad Request: Missing assignmentId or fileName.');
      }

      const assignment = await storage.getAssignment(body.assignmentId);
      if (!assignment) return sendError(404, `Assignment ${body.assignmentId} not found.`);

      // Enforce student ownership: studentId must match authenticated user
      const studentId = user.userId;
      const studentName = user.name;
      const version = body.version || 'v1.0';
      const subjectCode = assignment.subjectCode;

      // S3 object key follows structured secure naming convention
      const expectedPrefix = `assignments/${subjectCode}/${body.assignmentId}/${studentId}/${version}/`;
      const s3Key = body.s3Key && body.s3Key.startsWith(expectedPrefix)
        ? body.s3Key
        : `${expectedPrefix}${body.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

      const newSubmission = await storage.createSubmission({
        studentId,
        studentName,
        studentRoll: studentId,
        assignmentId: body.assignmentId,
        subjectCode,
        title: body.title || 'Course Submission',
        version,
        fileName: body.fileName,
        fileSize: body.fileSize || '1.0 MB',
        checksumSha256: body.checksumSha256 || 'simulated-sha256-' + Date.now(),
        s3Key,
        comment: body.comment || '',
        status: 'Pending Review'
      });

      return sendJson(201, newSubmission);
    }

    // -------------------------------------------------------------
    // Route: PATCH /api/submissions/:id/review
    // Faculty only: approve or request changes + feedback + rubric
    // -------------------------------------------------------------
    const reviewMatch = pathname.match(/^\/api\/submissions\/([a-zA-Z0-9_\-]+)\/review$/);
    if (reviewMatch && method === 'PATCH') {
      if (user.role !== 'teacher') {
        return sendError(403, 'Forbidden: Only faculty members can grade or review submissions.');
      }

      const submissionId = reviewMatch[1];
      const submission = await storage.getSubmission(submissionId);

      if (!submission) {
        return sendError(404, `Submission ${submissionId} not found.`);
      }

      // Verify that this teacher teaches the course
      const subject = await storage.getSubject(submission.subjectCode);
      if (!subject || subject.instructorId !== user.userId) {
        return sendError(403, `Forbidden: You are not authorized to grade submissions for ${submission.subjectCode}.`);
      }

      const body = await readBody();

      // Accept either 'status' or 'action' field from frontend
      let status = body.status;
      if (!status && body.action) {
        status = body.action === 'approve' ? 'Approved' : 'Needs Revision';
      }

      if (!['Approved', 'Needs Revision', 'Pending Review'].includes(status)) {
        return sendError(400, 'Bad Request: Status must be "Approved", "Needs Revision", or "Pending Review".');
      }

      const updated = await storage.saveReview(submissionId, {
        status,
        feedback: body.feedback,
        scores: body.scores,
        reviewedBy: user.userId
      });

      return sendJson(200, updated);
    }

    // -------------------------------------------------------------
    // Route: POST /api/uploads/presign
    // Pre-signed S3 PUT URL Generator
    // -------------------------------------------------------------
    if (pathname === '/api/uploads/presign' && method === 'POST') {
      if (user.role !== 'student') {
        return sendError(403, 'Forbidden: Pre-signed upload URLs are restricted to enrolled students.');
      }

      const body = await readBody();
      const { fileName, fileType, contentType, assignmentId, version = 'v1.0' } = body;
      const fileSizeBytes = Number(body.fileSizeBytes);

      if (!fileName || !assignmentId) {
        return sendError(400, 'Bad Request: Missing fileName or assignmentId.');
      }
      if (!Number.isInteger(fileSizeBytes) || fileSizeBytes < 1 || fileSizeBytes > 25 * 1024 * 1024) {
        return sendError(400, 'File must be between 1 byte and 25 MB.');
      }

      const assignment = await storage.getAssignment(assignmentId);
      if (!assignment) return sendError(404, `Assignment ${assignmentId} not found.`);
      const subjectCode = assignment.subjectCode;

      const existing = (await storage.listSubmissions({ studentId: user.userId }))
        .find(submission => submission.assignmentId === assignmentId);
      const usedVersions = existing?.revisions?.map(revision => revision.version) || [];
      let effectiveVersion = version;
      if (usedVersions.includes(effectiveVersion)) {
        const match = /^v(\d+)\.(\d+)$/.exec(effectiveVersion);
        effectiveVersion = match ? `v${match[1]}.${Number(match[2]) + 1}` : `v1.${usedVersions.length}`;
        while (usedVersions.includes(effectiveVersion)) {
          const next = /^v(\d+)\.(\d+)$/.exec(effectiveVersion);
          effectiveVersion = next ? `v${next[1]}.${Number(next[2]) + 1}` : `v1.${usedVersions.length + 1}`;
        }
      }

      const sanitizedFile = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const s3Key = `assignments/${subjectCode}/${assignmentId}/${user.userId}/${effectiveVersion}/${sanitizedFile}`;

      if (config.STORAGE_MODE === 'aws' && !s3Client) {
        return sendError(503, 'AWS S3 client is unavailable; local mock upload is disabled in AWS mode.');
      }
      if (config.STORAGE_MODE === 'aws') {
        // Real AWS S3 Pre-Signed PUT URL
        try {
          const command = new PutObjectCommand({
            Bucket: config.AWS.S3_BUCKET,
            Key: s3Key,
            ContentLength: fileSizeBytes,
            ContentType: contentType || fileType || 'application/octet-stream',
            Metadata: {
              studentId: user.userId,
              assignmentId: assignmentId,
              version: effectiveVersion
            }
          });

          const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 mins

          return sendJson(200, {
            mode: 'aws',
            version: effectiveVersion,
            uploadUrl: presignedUrl,
            method: 'PUT',
            headers: { 'Content-Type': contentType || fileType || 'application/octet-stream' },
            s3Bucket: config.AWS.S3_BUCKET,
            s3Key,
            expiresInSeconds: 900
          });
        } catch (s3Err) {
          console.error(`[S3 PreSign] AWS signing failed:`, s3Err.message);
          return sendError(503, 'AWS S3 upload signing is unavailable. No mock upload was created.');
        }
      }

      // Local / Mock Mode Pre-Signed Response
      return sendJson(200, {
        mode: 'local-mock',
        version: effectiveVersion,
        uploadUrl: `/api/uploads/mock-s3-upload?s3Key=${encodeURIComponent(s3Key)}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/octet-stream' },
        s3Bucket: config.AWS.S3_BUCKET,
        s3Key,
        expiresInSeconds: 900
      });
    }

    // -------------------------------------------------------------
    // Route: PUT /api/uploads/mock-s3-upload
    // Mock S3 endpoint for end-to-end testing in local development
    // -------------------------------------------------------------
    if (pathname === '/api/uploads/mock-s3-upload' && method === 'PUT') {
      const s3Key = url.searchParams.get('s3Key') || 'mock-file';
      // Read binary chunks
      let totalBytes = 0;
      req.on('data', chunk => { totalBytes += chunk.length; });
      req.on('end', () => {
        return sendJson(200, {
          message: 'File bytes successfully received by mock S3 endpoint.',
          s3Key,
          bytesReceived: totalBytes,
          etag: '"' + Date.now().toString(16) + '"'
        });
      });
      return;
    }

    // 404 for unknown API routes
    return sendError(404, `API route not found: ${method} ${pathname}`);
  } catch (err) {
    console.error(`[API Error] ${method} ${pathname}:`, err);
    return sendError(err.statusCode || 500, err.statusCode ? err.message : `Internal Server Error: ${err.message}`);
  }
}

module.exports = {
  handleApiRequest
};
