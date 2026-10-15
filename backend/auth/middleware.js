const { getStorage } = require('../storage');

async function authenticate(req) {
  const storage = getStorage();
  
  // In production, decode and verify AWS Cognito JWT from Authorization: Bearer <token>
  // In demo/hybrid mode, read identity from x-user-id / x-user-role headers
  let userId = req.headers['x-user-id'];
  let role = req.headers['x-user-role'];

  if (!userId) {
    // Default fallback to student Alex Chen for direct browser hits
    userId = 'CS-2023-084';
    role = 'student';
  }

  let user = await storage.getUser(userId);
  if (!user) {
    // Fallback if ID is student or teacher
    user = {
      userId,
      role: role || (userId.startsWith('FAC') ? 'teacher' : 'student'),
      name: userId.startsWith('FAC') ? 'Dr. Evelyn Reed' : 'Alex Chen'
    };
  }

  return user;
}

module.exports = {
  authenticate
};
