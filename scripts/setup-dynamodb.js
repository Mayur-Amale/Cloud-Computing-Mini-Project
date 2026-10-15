/**
 * DynamoDB Table Provisioning & Seeding Script
 * 
 * Usage:
 *   node scripts/setup-dynamodb.js
 * 
 * Environment variables:
 *   AWS_REGION=us-east-1 (or ap-south-1)
 *   DYNAMODB_TABLE=StudentDrive_Main
 *   DYNAMODB_ENDPOINT=http://localhost:8000 (optional, for DynamoDB Local)
 */

const {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists
} = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand
} = require('@aws-sdk/lib-dynamodb');
const config = require('../backend/config');
const seedData = require('../backend/storage/seed-data');

async function putSeedIfMissing(docClient, item) {
  try {
    await docClient.send(new PutCommand({
      TableName: config.AWS.DYNAMODB_TABLE,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)'
    }));
  } catch (err) {
    if (err.name !== 'ConditionalCheckFailedException') throw err;
  }
}

async function setupDynamoDB() {
  console.log('====================================================');
  console.log(' Amazon DynamoDB Table Setup & Provisioning Script ');
  console.log('====================================================');
  console.log(`Target Table:    ${config.AWS.DYNAMODB_TABLE}`);
  console.log(`AWS Region:      ${config.AWS.REGION}`);
  console.log(`Custom Endpoint: ${config.AWS.DYNAMODB_ENDPOINT || 'None (AWS Cloud)'}`);
  console.log('----------------------------------------------------');

  const clientConfig = { region: config.AWS.REGION };
  if (config.AWS.DYNAMODB_ENDPOINT) {
    clientConfig.endpoint = config.AWS.DYNAMODB_ENDPOINT;
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'localKey',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'localSecret'
    };
  }

  const client = new DynamoDBClient(clientConfig);
  const docClient = DynamoDBDocumentClient.from(client);

  // 1. Check if table already exists
  let tableExists = false;
  try {
    const describeRes = await client.send(
      new DescribeTableCommand({ TableName: config.AWS.DYNAMODB_TABLE })
    );
    if (describeRes.Table && describeRes.Table.TableStatus === 'ACTIVE') {
      tableExists = true;
      console.log(`[Status] Table "${config.AWS.DYNAMODB_TABLE}" already exists and is ACTIVE.`);
    }
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      tableExists = false;
    } else {
      console.warn(`[Describe Warning] ${err.message}`);
    }
  }

  // 2. Create Table if not existing
  if (!tableExists) {
    console.log(`[Create] Provisioning table "${config.AWS.DYNAMODB_TABLE}" with single-table design & GSIs...`);

    const createParams = {
      TableName: config.AWS.DYNAMODB_TABLE,
      BillingMode: 'PAY_PER_REQUEST',
      KeySchema: [
        { AttributeName: 'PK', KeyType: 'HASH' },
        { AttributeName: 'SK', KeyType: 'RANGE' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'PK', AttributeType: 'S' },
        { AttributeName: 'SK', AttributeType: 'S' },
        { AttributeName: 'GSI1PK', AttributeType: 'S' },
        { AttributeName: 'GSI1SK', AttributeType: 'S' },
        { AttributeName: 'GSI2PK', AttributeType: 'S' },
        { AttributeName: 'GSI2SK', AttributeType: 'S' },
        { AttributeName: 'GSI3PK', AttributeType: 'S' },
        { AttributeName: 'GSI3SK', AttributeType: 'S' },
        { AttributeName: 'GSI4PK', AttributeType: 'S' },
        { AttributeName: 'GSI4SK', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'GSI1', // Teacher -> Subjects taught
          KeySchema: [
            { AttributeName: 'GSI1PK', KeyType: 'HASH' },
            { AttributeName: 'GSI1SK', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        },
        {
          IndexName: 'GSI2', // AssignmentId -> Metadata lookup
          KeySchema: [
            { AttributeName: 'GSI2PK', KeyType: 'HASH' },
            { AttributeName: 'GSI2SK', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        },
        {
          IndexName: 'GSI3', // Student -> Submissions chronological
          KeySchema: [
            { AttributeName: 'GSI3PK', KeyType: 'HASH' },
            { AttributeName: 'GSI3SK', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        },
        {
          IndexName: 'GSI4', // Subject -> Submissions by Status & Time
          KeySchema: [
            { AttributeName: 'GSI4PK', KeyType: 'HASH' },
            { AttributeName: 'GSI4SK', KeyType: 'RANGE' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ]
    };

    await client.send(new CreateTableCommand(createParams));
    console.log(`[Create] CreateTable request sent. Waiting for table to become ACTIVE...`);
    await waitUntilTableExists({ client, maxWaitTime: 120 }, { TableName: config.AWS.DYNAMODB_TABLE });
    console.log(`[Create] Table "${config.AWS.DYNAMODB_TABLE}" is now ACTIVE!`);
  }

  // 3. Seed Canonical Academic Records
  console.log(`[Seed] Seeding academic data into DynamoDB...`);

  // Users
  for (const user of seedData.users) {
    await putSeedIfMissing(docClient, {
          PK: `USER#${user.userId}`,
          SK: 'PROFILE',
          entityType: 'USER',
          ...user
        });
  }
  console.log(`[Seed] Seeded ${seedData.users.length} user records.`);

  // Subjects
  for (const subject of seedData.subjects) {
    await putSeedIfMissing(docClient, {
          PK: `SUBJECT#${subject.subjectCode}`,
          SK: 'METADATA',
          GSI1PK: `TEACHER#${subject.instructorId}`,
          GSI1SK: `SUBJECT#${subject.subjectCode}`,
          entityType: 'SUBJECT',
          ...subject
        });
  }
  console.log(`[Seed] Seeded ${seedData.subjects.length} subject records.`);

  // Assignments
  for (const asg of seedData.assignments) {
    await putSeedIfMissing(docClient, {
          PK: `SUBJECT#${asg.subjectCode}`,
          SK: `ASSIGNMENT#${asg.assignmentId}`,
          GSI2PK: `ASSIGNMENT#${asg.assignmentId}`,
          GSI2SK: 'METADATA',
          entityType: 'ASSIGNMENT',
          ...asg
        });
  }
  console.log(`[Seed] Seeded ${seedData.assignments.length} assignment records.`);

  // Submissions
  for (const sub of seedData.submissions) {
    await putSeedIfMissing(docClient, {
          PK: `SUBMISSION#${sub.submissionId}`,
          SK: 'METADATA',
          GSI3PK: `STUDENT#${sub.studentId}`,
          GSI3SK: `SUBMISSION#${sub.submittedAt}`,
          GSI4PK: `SUBJECT#${sub.subjectCode}`,
          GSI4SK: `STATUS#${sub.status}#${sub.submittedAt}`,
          entityType: 'SUBMISSION',
          ...sub
        });

    // Revisions
    for (const rev of sub.revisions || []) {
      await putSeedIfMissing(docClient, {
            PK: `SUBMISSION#${sub.submissionId}`,
            SK: `REVISION#${rev.version}`,
            entityType: 'REVISION',
            ...rev
          });
    }
  }
  console.log(`[Seed] Seeded ${seedData.submissions.length} submission records with revisions.`);
  console.log('====================================================');
  console.log(' DynamoDB Setup & Seeding Completed Successfully!  ');
  console.log('====================================================');
}

if (require.main === module) {
  setupDynamoDB().catch(err => {
    console.error('Fatal DynamoDB setup error:', err);
    process.exit(1);
  });
}

module.exports = {
  setupDynamoDB
};
