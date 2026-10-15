const config = require('../config');
const LocalStorageManager = require('./local-store');
const DynamoDBStorageManager = require('./dynamodb-store');

let storageInstance = null;

function getStorage() {
  if (storageInstance) {
    return storageInstance;
  }

  if (config.STORAGE_MODE === 'aws') {
    try {
      storageInstance = new DynamoDBStorageManager();
      console.log(`[Storage] Running in AWS DynamoDB Mode (Table: ${config.AWS.DYNAMODB_TABLE}, Region: ${config.AWS.REGION})`);
    } catch (err) {
      console.warn(`[Storage] Failed to initialize AWS DynamoDB, falling back to Local Mock Mode:`, err.message);
      storageInstance = new LocalStorageManager();
    }
  } else {
    storageInstance = new LocalStorageManager();
    console.log(`[Storage] Running in LOCAL MOCK Mode (Persistence file: ${config.LOCAL_DB_FILE})`);
  }

  return storageInstance;
}

module.exports = {
  getStorage
};
