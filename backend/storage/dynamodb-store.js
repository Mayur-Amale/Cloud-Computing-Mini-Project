const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  ScanCommand
} = require('@aws-sdk/lib-dynamodb');
const config = require('../config');

class DynamoDBStorageManager {
  constructor() {
    this.tableName = config.AWS.DYNAMODB_TABLE;
    const clientConfig = {
      region: config.AWS.REGION
    };

    if (config.AWS.DYNAMODB_ENDPOINT) {
      clientConfig.endpoint = config.AWS.DYNAMODB_ENDPOINT;
      clientConfig.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'localKey',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'localSecret'
      };
    }

    const rawClient = new DynamoDBClient(clientConfig);
    this.docClient = DynamoDBDocumentClient.from(rawClient, {
      marshallOptions: {
        removeUndefinedValues: true
      }
    });

    console.log(`[DynamoDBStorage] Initialized for table: ${this.tableName} (Region: ${config.AWS.REGION})`);
  }

  async getUser(userId) {
    const res = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `USER#${userId}`,
          SK: 'PROFILE'
        }
      })
    );
    return res.Item ? this._cleanEntity(res.Item) : null;
  }

  async listUsers() {
    const res = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(PK, :prefix) AND SK = :profile',
        ExpressionAttributeValues: {
          ':prefix': 'USER#',
          ':profile': 'PROFILE'
        }
      })
    );
    return (res.Items || []).map(this._cleanEntity);
  }

  async listSubjects(teacherId = null) {
    if (teacherId) {
      const res = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :gsi1sk)',
          ExpressionAttributeValues: {
            ':gsi1pk': `TEACHER#${teacherId}`,
            ':gsi1sk': 'SUBJECT#'
          }
        })
      );
      return (res.Items || []).map(this._cleanEntity);
    }

    const res = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(PK, :sub) AND SK = :meta',
        ExpressionAttributeValues: {
          ':sub': 'SUBJECT#',
          ':meta': 'METADATA'
        }
      })
    );
    return (res.Items || []).map(this._cleanEntity);
  }

  async getSubject(subjectCode) {
    const res = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `SUBJECT#${subjectCode}`,
          SK: 'METADATA'
        }
      })
    );
    return res.Item ? this._cleanEntity(res.Item) : null;
  }

  async listAssignments(subjectCode = null) {
    if (subjectCode) {
      const res = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `SUBJECT#${subjectCode}`,
            ':skPrefix': 'ASSIGNMENT#'
          }
        })
      );
      return (res.Items || []).map(this._cleanEntity);
    }

    const res = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(SK, :asg)',
        ExpressionAttributeValues: {
          ':asg': 'ASSIGNMENT#'
        }
      })
    );
    return (res.Items || []).map(this._cleanEntity);
  }

  async getAssignment(assignmentId) {
    const res = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI2',
        KeyConditionExpression: 'GSI2PK = :gsi2pk AND GSI2SK = :meta',
        ExpressionAttributeValues: {
          ':gsi2pk': `ASSIGNMENT#${assignmentId}`,
          ':meta': 'METADATA'
        }
      })
    );
    return (res.Items && res.Items[0]) ? this._cleanEntity(res.Items[0]) : null;
  }

  async createAssignment(assignment) {
    const item = {
      PK: `SUBJECT#${assignment.subjectCode}`,
      SK: `ASSIGNMENT#${assignment.assignmentId}`,
      GSI2PK: `ASSIGNMENT#${assignment.assignmentId}`,
      GSI2SK: 'METADATA',
      entityType: 'ASSIGNMENT',
      ...assignment
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
        ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
      })
    );

    return this._cleanEntity(item);
  }

  async listSubmissions({ studentId = null, subjectCodes = null, status = null } = {}) {
    if (studentId) {
      const res = await this.docClient.send(
        new QueryCommand({
          TableName: this.tableName,
          IndexName: 'GSI3',
          KeyConditionExpression: 'GSI3PK = :gsi3pk',
          ExpressionAttributeValues: {
            ':gsi3pk': `STUDENT#${studentId}`
          },
          ScanIndexForward: false
        })
      );
      let items = (res.Items || []).map(this._cleanEntity);
      if (status && status !== 'ALL') {
        items = items.filter(i => i.status === status);
      }
      return items;
    }

    if (subjectCodes && Array.isArray(subjectCodes) && subjectCodes.length > 0) {
      const results = [];
      for (const code of subjectCodes) {
        const queryParams = {
          TableName: this.tableName,
          IndexName: 'GSI4',
          KeyConditionExpression: 'GSI4PK = :gsi4pk',
          ExpressionAttributeValues: {
            ':gsi4pk': `SUBJECT#${code}`
          },
          ScanIndexForward: false
        };

        if (status && status !== 'ALL') {
          queryParams.KeyConditionExpression += ' AND begins_with(GSI4SK, :statusPrefix)';
          queryParams.ExpressionAttributeValues[':statusPrefix'] = `STATUS#${status}`;
        }

        const res = await this.docClient.send(new QueryCommand(queryParams));
        if (res.Items) {
          results.push(...res.Items.map(this._cleanEntity));
        }
      }
      return results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    // Fallback scan (administrative)
    const res = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: 'begins_with(PK, :sub) AND SK = :meta',
        ExpressionAttributeValues: {
          ':sub': 'SUBMISSION#',
          ':meta': 'METADATA'
        }
      })
    );
    let items = (res.Items || []).map(this._cleanEntity);
    if (status && status !== 'ALL') {
      items = items.filter(i => i.status === status);
    }
    return items.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  }

  async getSubmission(submissionId) {
    const res = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          PK: `SUBMISSION#${submissionId}`,
          SK: 'METADATA'
        }
      })
    );
    return res.Item ? this._cleanEntity(res.Item) : null;
  }

  async createSubmission(sub) {
    const submissionId = sub.submissionId || `sub-${Date.now()}`;
    const submittedAt = new Date().toISOString();
    const version = sub.version || 'v1.0';

    const item = {
      PK: `SUBMISSION#${submissionId}`,
      SK: 'METADATA',
      GSI3PK: `STUDENT#${sub.studentId}`,
      GSI3SK: `SUBMISSION#${submittedAt}`,
      GSI4PK: `SUBJECT#${sub.subjectCode}`,
      GSI4SK: `STATUS#${sub.status || 'Pending Review'}#${submittedAt}`,
      entityType: 'SUBMISSION',
      ...sub,
      submissionId,
      version,
      submittedAt,
      status: sub.status || 'Pending Review'
    };

    // Save main submission metadata
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item
      })
    );

    // Save revision entry
    const revisionItem = {
      PK: `SUBMISSION#${submissionId}`,
      SK: `REVISION#${version}`,
      entityType: 'REVISION',
      version,
      fileName: sub.fileName,
      fileSize: sub.fileSize,
      s3Key: sub.s3Key,
      submittedAt,
      comment: sub.comment || 'Submission revision'
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: revisionItem
      })
    );

    return this._cleanEntity(item);
  }

  async saveReview(submissionId, { status, feedback, scores, reviewedBy }) {
    const reviewedAt = new Date().toISOString();
    const sub = await this.getSubmission(submissionId);
    if (!sub) {
      throw new Error(`Submission ${submissionId} not found.`);
    }

    const newGsi4SK = `STATUS#${status}#${sub.submittedAt}`;

    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          PK: `SUBMISSION#${submissionId}`,
          SK: 'METADATA'
        },
        UpdateExpression: 'SET #s = :status, feedback = :feedback, scores = :scores, reviewedBy = :reviewedBy, reviewedAt = :reviewedAt, GSI4SK = :gsi4sk',
        ExpressionAttributeNames: {
          '#s': 'status'
        },
        ExpressionAttributeValues: {
          ':status': status,
          ':feedback': feedback || sub.feedback || '',
          ':scores': scores || sub.scores || {},
          ':reviewedBy': reviewedBy || sub.reviewedBy || 'FAC-UNKNOWN',
          ':reviewedAt': reviewedAt,
          ':gsi4sk': newGsi4SK
        }
      })
    );

    return await this.getSubmission(submissionId);
  }

  _cleanEntity(item) {
    if (!item) return null;
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, GSI3PK, GSI3SK, GSI4PK, GSI4SK, entityType, ...rest } = item;
    return rest;
  }
}

module.exports = DynamoDBStorageManager;
