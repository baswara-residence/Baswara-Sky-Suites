import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
];
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export interface SignInResponse {
  user: User | null;
  accessToken: string | null;
  cancelled?: boolean;
  error?: string;
}

export const googleSignIn = async (): Promise<SignInResponse> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      return {
        user: null,
        accessToken: null,
        error: 'Tidak berhasil mendapatkan token akses Google.',
      };
    }

    cachedAccessToken = credential.accessToken;
    if (result.user?.email) {
      try {
        await saveAdminToken(cachedAccessToken, result.user.email);
      } catch {}
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    const code = error?.code || '';
    // User intentionally closed popup or cancelled the authorization window
    if (
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/user-cancelled'
    ) {
      return { user: null, accessToken: null, cancelled: true };
    }

    if (code === 'auth/popup-blocked') {
      return {
        user: null,
        accessToken: null,
        error: 'Jendela login Google terblokir oleh peramban (pop-up blocker). Harap izinkan pop-up dan coba lagi.',
      };
    }

    return {
      user: null,
      accessToken: null,
      error: error?.message || 'Gagal login Google.',
    };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  // Check localStorage for administrator token
  try {
    const local = localStorage.getItem('baswara_admin_google_token');
    if (local) {
      cachedAccessToken = local;
      return local;
    }
  } catch {}

  // Check backend server session
  try {
    const res = await fetch('/api/admin/google-token');
    if (res.ok) {
      const data = await res.json();
      if (data.accessToken) {
        cachedAccessToken = data.accessToken;
        try {
          localStorage.setItem('baswara_admin_google_token', data.accessToken);
        } catch {}
        return data.accessToken;
      }
    }
  } catch {}

  return null;
};

export const getAdminAccessToken = getAccessToken;

export const saveAdminToken = async (token: string, email: string = 'feel.ix.ee@gmail.com') => {
  cachedAccessToken = token;
  try {
    localStorage.setItem('baswara_admin_google_token', token);
    localStorage.setItem('baswara_admin_google_email', email);
  } catch {}

  try {
    await fetch('/api/admin/google-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: token, email }),
    });
  } catch {}
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  try {
    localStorage.removeItem('baswara_admin_google_token');
  } catch {}
};
