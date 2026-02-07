import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Linking } from 'react-native';
import type { User } from '../store/authStore';

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

// Google OAuth client IDs
const GOOGLE_WEB_CLIENT_ID = '449600456921-u1ndq80oo4varmbdoaht3e3usijj2t2o.apps.googleusercontent.com';
const GOOGLE_IOS_CLIENT_ID = '449600456921-39rs3njkjl2hsjb8ltk81hq8nuso0nbv.apps.googleusercontent.com';

// Reversed client ID for iOS redirect (must match Info.plist CFBundleURLSchemes)
const GOOGLE_IOS_REDIRECT_URI = 'com.googleusercontent.apps.449600456921-39rs3njkjl2hsjb8ltk81hq8nuso0nbv:/oauth';

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const clientId = Platform.OS === 'ios' ? GOOGLE_IOS_CLIENT_ID : GOOGLE_WEB_CLIENT_ID;
    const redirectUri = GOOGLE_IOS_REDIRECT_URI;

    // Generate code verifier and challenge for PKCE
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Build the Google OAuth URL with authorization code flow + PKCE
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid profile email');
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    console.log('Google OAuth URL:', authUrl.toString());

    // Open the auth URL in a browser
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl.toString(),
      redirectUri
    );

    console.log('Auth result:', result);

    if (result.type === 'success' && result.url) {
      // Parse the authorization code from the URL
      const url = new URL(result.url);
      const code = url.searchParams.get('code');

      if (!code) {
        throw new Error('No authorization code in response');
      }

      // Exchange the code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          code: code,
          code_verifier: codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }).toString(),
      });

      const tokens = await tokenResponse.json();

      if (!tokens.access_token) {
        console.error('Token exchange failed:', tokens);
        throw new Error('Failed to exchange code for tokens');
      }

      // Fetch user info with the access token
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );

      const userInfo = await userInfoResponse.json();

      return {
        id: userInfo.id,
        email: userInfo.email,
        displayName: userInfo.name || userInfo.email.split('@')[0],
        photoUrl: userInfo.picture,
        provider: 'google',
      };
    }

    return null;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// PKCE helper functions
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  // Convert base64 to base64url
  return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function signInWithApple(): Promise<User | null> {
  try {
    // Check if Apple Sign-In is available
    const isAvailable = await AppleAuthentication.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Apple Sign-In is not available on this device');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    // Generate a unique ID from the user identifier
    const hashedId = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      credential.user
    );

    // Apple only provides name/email on first sign-in
    // After that, we need to use stored values or defaults
    const displayName = credential.fullName
      ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
      : 'Apple User';

    return {
      id: hashedId.substring(0, 32),
      email: credential.email || `${hashedId.substring(0, 8)}@privaterelay.appleid.com`,
      displayName: displayName || 'Apple User',
      provider: 'apple',
    };
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') {
      // User cancelled the sign-in
      return null;
    }
    console.error('Apple sign-in error:', error);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  // For now, just clear local state
  // In a real app, you might want to revoke tokens with the providers
  return Promise.resolve();
}

export async function checkAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  return AppleAuthentication.isAvailableAsync();
}
