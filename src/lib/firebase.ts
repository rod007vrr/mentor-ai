// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: 'AIzaSyCDw6DxV0-jDYCr38c0SzyS5sHLWLyIPPg',
	authDomain: 'mentor-ai-007.firebaseapp.com',
	projectId: 'mentor-ai-007',
	storageBucket: 'mentor-ai-007.appspot.com',
	messagingSenderId: '1001620740117',
	appId: '1:1001620740117:web:3718081525263f791a161c',
	measurementId: 'G-3C062RS40C'
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
