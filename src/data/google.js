// The game's Google sign-in "Web client ID" from Google Cloud Console (APIs & Services → Credentials).
// It is public (not a secret). While it is empty, the "Sign in with Google" button is hidden.
// The online server (netlify/functions/api.mjs) reads it too, to check sign-in tokens.
export const GOOGLE_CLIENT_ID = '';
