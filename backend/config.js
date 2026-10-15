const path = require('path');

const hasAwsEnv = Boolean(
  (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ||
  process.env.DYNAMODB_ENDPOINT ||
  process.env.AWS_PROFILE
);

const storageMode = process.env.STORAGE_MODE
  ? process.env.STORAGE_MODE.toLowerCase()
  : (hasAwsEnv ? 'aws' : 'local');

module.exports = {
  PORT: process.env.PORT || 3000,
  ROOT_DIR: path.resolve(__dirname, '..'),
  DATA_DIR: path.resolve(__dirname, '..', 'data'),
  LOCAL_DB_FILE: path.resolve(__dirname, '..', 'data', 'student_drive_db.json'),
  STORAGE_MODE: storageMode,
  AWS: {
    REGION: process.env.AWS_REGION || 'us-east-1',
    DYNAMODB_TABLE: process.env.DYNAMODB_TABLE || 'StudentDrive_Main',
    DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT || null,
    S3_BUCKET: process.env.S3_BUCKET || 'student-drive-assignments-dyp-dpu',
    S3_ENDPOINT: process.env.S3_ENDPOINT || null
  }
};
