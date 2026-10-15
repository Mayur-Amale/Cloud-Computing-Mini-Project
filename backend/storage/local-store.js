const fs = require('fs');
const path = require('path');
const config = require('../config');
const seedData = require('./seed-data');

class LocalStorageManager {
  constructor() {
    this.filePath = config.LOCAL_DB_FILE;
    this.data = null;
    this.init();
  }

  init() {
    if (!fs.existsSync(config.DATA_DIR)) {
      fs.mkdirSync(config.DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      this.data = JSON.parse(JSON.stringify(seedData));
      this.save();
      console.log(`[LocalStorage] Initialized persistent database at ${this.filePath}`);
    } else {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
        console.log(`[LocalStorage] Loaded database from ${this.filePath}`);
      } catch (err) {
        console.error(`[LocalStorage] Failed to parse db file, re-seeding:`, err);
        this.data = JSON.parse(JSON.stringify(seedData));
        this.save();
      }
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error(`[LocalStorage] Write error:`, err);
    }
  }

  async getUser(userId) {
    return this.data.users.find(u => u.userId === userId) || null;
  }

  async listUsers() {
    return this.data.users;
  }

  async listSubjects(teacherId = null) {
    if (teacherId) {
      return this.data.subjects.filter(s => s.instructorId === teacherId);
    }
    return this.data.subjects;
  }

  async getSubject(subjectCode) {
    return this.data.subjects.find(s => s.subjectCode === subjectCode) || null;
  }

  async listAssignments(subjectCode = null) {
    if (subjectCode) {
      return this.data.assignments.filter(a => a.subjectCode === subjectCode);
    }
    return this.data.assignments;
  }

  async getAssignment(assignmentId) {
    return this.data.assignments.find(a => a.assignmentId === assignmentId) || null;
  }

  async createAssignment(assignment) {
    const exists = this.data.assignments.some(a => a.assignmentId === assignment.assignmentId);
    if (exists) {
      throw new Error(`Assignment with ID ${assignment.assignmentId} already exists.`);
    }
    this.data.assignments.unshift(assignment);
    this.save();
    return assignment;
  }

  async listSubmissions({ studentId = null, subjectCodes = null, status = null } = {}) {
    let result = [...this.data.submissions];

    if (studentId) {
      result = result.filter(s => s.studentId === studentId);
    } else if (subjectCodes && Array.isArray(subjectCodes)) {
      result = result.filter(s => subjectCodes.includes(s.subjectCode));
    }

    if (status && status !== 'ALL') {
      result = result.filter(s => s.status === status);
    }

    return result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  async getSubmission(submissionId) {
    return this.data.submissions.find(s => s.submissionId === submissionId) || null;
  }

  async createSubmission(sub) {
    const existingIndex = this.data.submissions.findIndex(
      s => s.studentId === sub.studentId && s.assignmentId === sub.assignmentId
    );

    if (existingIndex >= 0) {
      const existing = this.data.submissions[existingIndex];
      const revisions = existing.revisions || [];
      let newVersion = sub.version || `v1.${revisions.length}`;
      if (revisions.some(revision => revision.version === newVersion)) {
        const match = /^v(\d+)\.(\d+)$/.exec(newVersion);
        newVersion = match ? `v${match[1]}.${Number(match[2]) + 1}` : `v1.${revisions.length}`;
      }
      
      const revisionEntry = {
        version: newVersion,
        fileName: sub.fileName,
        fileSize: sub.fileSize,
        s3Key: sub.s3Key,
        submittedAt: new Date().toISOString(),
        comment: sub.comment || ''
      };

      const updated = {
        ...existing,
        ...sub,
        version: newVersion,
        status: 'Pending Review',
        submittedAt: new Date().toISOString(),
        revisions: [revisionEntry, ...revisions],
        feedback: '',
        reviewedBy: null,
        reviewedAt: null
      };

      this.data.submissions[existingIndex] = updated;
      this.save();
      return updated;
    } else {
      const newRecord = {
        ...sub,
        submissionId: sub.submissionId || `sub-${Date.now()}`,
        version: sub.version || 'v1.0',
        status: 'Pending Review',
        submittedAt: new Date().toISOString(),
        revisions: [
          {
            version: sub.version || 'v1.0',
            fileName: sub.fileName,
            fileSize: sub.fileSize,
            s3Key: sub.s3Key,
            submittedAt: new Date().toISOString(),
            comment: sub.comment || 'Initial submission'
          }
        ]
      };

      this.data.submissions.unshift(newRecord);
      this.save();
      return newRecord;
    }
  }

  async saveReview(submissionId, { status, feedback, scores, reviewedBy }) {
    const sub = this.data.submissions.find(s => s.submissionId === submissionId);
    if (!sub) {
      throw new Error(`Submission ${submissionId} not found.`);
    }

    sub.status = status;
    sub.feedback = feedback !== undefined ? feedback : sub.feedback;
    if (scores) {
      sub.scores = scores;
    }
    sub.reviewedBy = reviewedBy || sub.reviewedBy;
    sub.reviewedAt = new Date().toISOString();

    this.save();
    return sub;
  }
}

module.exports = LocalStorageManager;
