import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Save site content to Firestore
export async function saveSiteContentToFirebase(content) {
  try {
    const contentRef = doc(db, 'cms', 'content');
    await setDoc(contentRef, { data: content, updatedAt: new Date() });
    console.log('Content saved to Firebase');
    return true;
  } catch (error) {
    console.error('Error saving content:', error);
    return false;
  }
}

// Load site content from Firestore
export async function loadSiteContentFromFirebase() {
  try {
    const contentRef = doc(db, 'cms', 'content');
    const docSnap = await getDoc(contentRef);
    if (docSnap.exists()) {
      console.log('Content loaded from Firebase');
      return docSnap.data().data;
    }
    return null;
  } catch (error) {
    console.error('Error loading content:', error);
    return null;
  }
}

// Save theme to Firestore
export async function saveThemeToFirebase(theme) {
  try {
    const themeRef = doc(db, 'cms', 'theme');
    await setDoc(themeRef, { data: theme, updatedAt: new Date() });
    console.log('Theme saved to Firebase');
    return true;
  } catch (error) {
    console.error('Error saving theme:', error);
    return false;
  }
}

// Load theme from Firestore
export async function loadThemeFromFirebase() {
  try {
    const themeRef = doc(db, 'cms', 'theme');
    const docSnap = await getDoc(themeRef);
    if (docSnap.exists()) {
      console.log('Theme loaded from Firebase');
      return docSnap.data().data;
    }
    return null;
  } catch (error) {
    console.error('Error loading theme:', error);
    return null;
  }
}
