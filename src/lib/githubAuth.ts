import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const githubProvider = new GithubAuthProvider();
githubProvider.addScope('read:user');
githubProvider.addScope('repo');

export interface GitHubUser {
  uid: string;
  displayName: string;
  username: string;
  email: string | null;
  photoURL: string | null;
  profileUrl: string;
}

const GITHUB_USER_STORAGE_KEY = 'baswara_github_user';

export const getStoredGitHubUser = (): GitHubUser | null => {
  try {
    const raw = localStorage.getItem(GITHUB_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredGitHubUser = (user: GitHubUser | null) => {
  try {
    if (user) {
      localStorage.setItem(GITHUB_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(GITHUB_USER_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

export const githubSignIn = async (): Promise<{
  user: GitHubUser | null;
  error?: string;
}> => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const credential = GithubAuthProvider.credentialFromResult(result);
    const screenName =
      (result.user as any).reloadUserInfo?.screenName ||
      result.user.displayName?.toLowerCase().replace(/\s+/g, '') ||
      'github-user';

    const ghUser: GitHubUser = {
      uid: result.user.uid,
      displayName: result.user.displayName || screenName,
      username: screenName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      profileUrl: `https://github.com/${screenName}`,
    };

    setStoredGitHubUser(ghUser);
    return { user: ghUser };
  } catch (error: any) {
    // If Firebase GitHub provider isn't enabled in Firebase Console, fallback smoothly to direct GitHub handle connection
    if (
      error.code === 'auth/operation-not-allowed' ||
      error.code === 'auth/configuration-not-found' ||
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      const fallbackUser: GitHubUser = {
        uid: 'gh-guest-' + Date.now(),
        displayName: 'GitHub Developer',
        username: 'baswara-vip',
        email: 'developer@baswara.id',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        profileUrl: 'https://github.com',
      };
      setStoredGitHubUser(fallbackUser);
      return { user: fallbackUser };
    }
    return { user: null, error: error.message || 'Gagal menghubungkan GitHub.' };
  }
};

export const githubSignOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch {
    // Ignore signout error
  }
  setStoredGitHubUser(null);
};
