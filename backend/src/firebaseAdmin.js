const admin = require('firebase-admin');

const getFirebaseAuth = () => {
  if (admin.apps.length > 0) {
    return admin.auth();
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const serviceAccount = serviceAccountJson ? JSON.parse(serviceAccountJson) : null;
  const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount?.project_id;

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID must be configured for Google authentication');
  }

  const credential = serviceAccount
    ? admin.credential.cert(serviceAccount)
    : admin.credential.applicationDefault();

  admin.initializeApp({ credential, projectId });
  return admin.auth();
};

module.exports = { getFirebaseAuth };
