import { initializeApp } from "firebase/app";
import { getFirestore, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { getStorage } from "firebase/storage";

import { writable, derived, type Readable } from "svelte/store";
import { doc } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCDw6DxV0-jDYCr38c0SzyS5sHLWLyIPPg",
  authDomain: "mentor-ai-007.firebaseapp.com",
  projectId: "mentor-ai-007",
  storageBucket: "mentor-ai-007.appspot.com",
  messagingSenderId: "1001620740117",
  appId: "1:1001620740117:web:3718081525263f791a161c",
  measurementId: "G-3C062RS40C",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

function userStore() {
  if (!auth || !globalThis.window) {
    console.warn("Auth is not initialized or not in browser");
    const { subscribe } = writable<User | null>(null);
    return {
      subscribe,
    };
  }
  const { subscribe } = writable(auth?.currentUser ?? null, (set) => {
    onAuthStateChanged(auth, (user) => {
      set(user);
    });
  });

  return { subscribe };
}

function docStore<T>(path: string) {
  let unsubscribe: () => void;

  const docRef = doc(db, path);
  const { subscribe } = writable<T | null>(null, (set) => {
    unsubscribe = onSnapshot(docRef, (snapshot) => {
      set((snapshot.data() as T) ?? null);
    });
    return () => unsubscribe();
  });
  return { subscribe, ref: docRef, id: docRef.id };
}

export const user = userStore();

interface File {
  name: string;
  path: string;
  url: string;
}

interface UserData {
  username: string;
  bio: string;
  photoURL: string;
  files: File[];
}

export const userData: Readable<UserData | null> = derived(
  user,
  ($user, set) => {
    if ($user) {
      return docStore<UserData>(`users/${$user.uid}`).subscribe(set);
    } else {
      set(null);
    }
  }
);
