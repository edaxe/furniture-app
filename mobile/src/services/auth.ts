import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import type { User } from '../store/authStore';

// Complete the OAuth session
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration (Web client for expo-auth-session)
const GOOGLE_CLIENT_ID = '449600456921-u1ndq80oo4varmbdoaht3e3usijj2t2o.apps.googleusercontent.com';

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'furnishsnap',
    });

    const clientId = GOOGLE_CLIENT_ID;

    const request = new AuthSession.AuthRequest({
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
    });

    const result = await request.promptAsync(googleDiscovery);

    if (result.type === 'success' && result.authentication) {
      // Fetch user info with the access token
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${result.authentication.accessToken}`,
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
