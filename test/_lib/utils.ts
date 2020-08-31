import * as testing from '@firebase/testing'
import { setApp } from 'typesaurus/testing'

export function lockDB() {
  setApp(
    testing.initializeTestApp({
      projectId: 'project-id',
      auth: { uid: 'user-id' }
    })
  )
  return testing.loadFirestoreRules({
    projectId: 'project-id',
    rules: `
      rules_version = '2';
      service cloud.firestore {
        match /databases/{database}/documents {
          match /{document=**} {
            allow read, write: if false;
          }
        }
      }`
  })
}
