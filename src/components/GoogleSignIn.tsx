import React from 'react';
import { googleSignIn, logout } from '../lib/auth';
import { User } from 'firebase/auth';
import { LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

interface GoogleSignInProps {
  user: User | null;
  onSignInSuccess: (user: User, token: string) => void;
  onSignOut: () => void;
  isLoggingIn: boolean;
  setIsLoggingIn: (val: boolean) => void;
}

export default function GoogleSignIn({
  user,
  onSignInSuccess,
  onSignOut,
  isLoggingIn,
  setIsLoggingIn
}: GoogleSignInProps) {

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        onSignInSuccess(result.user, result.accessToken);
      }
    } catch (error) {
      console.error('Google Auth Failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onSignOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm" id="google-sign-in-container">
      <div className="flex items-center gap-3">
        {user ? (
          <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-emerald-500">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Profile'} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {user.displayName?.[0] || 'U'}
              </div>
            )}
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
            <UserIcon size={20} />
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-gray-950 font-sans tracking-tight">
            {user ? `Connected as ${user.displayName}` : 'OAuth Integrations Pending'}
          </h4>
          <p className="text-xs text-gray-500 font-mono">
            {user 
              ? 'Spreadsheets, Docs, and Calendar integration active' 
              : 'Sign in to sync mock spreadsheets, generate DOC report review & sync calendar.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-red-650 transition text-sm font-medium"
            id="btn-signout"
          >
            <LogOut size={16} />
            <span>Disconnect</span>
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className="gsi-material-button inline-flex cursor-pointer select-none items-center justify-center border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 max-sm:w-full rounded-xl disabled:opacity-50"
            id="btn-signin-google"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper flex items-center gap-3">
              <div className="gsi-material-button-icon flex-shrink-0">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '20px', height: '20px' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents font-sans font-medium">
                {isLoggingIn ? 'Connecting to Google...' : 'Authenticate Google Services'}
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
