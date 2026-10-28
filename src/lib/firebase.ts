import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';

// Native Firebase initializes itself from google-services.json / GoogleService-Info.plist.
// Until those files are added (see docs/firebase-setup.md) these calls throw at runtime,
// so only import this module from code paths that need a backend.
export const auth = () => getAuth(getApp());
export const firestore = () => getFirestore(getApp());
export const storage = () => getStorage(getApp());
