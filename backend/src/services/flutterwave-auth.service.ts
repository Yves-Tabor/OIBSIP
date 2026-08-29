import { env } from '../config/env';

interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

export const getFlutterwaveAccessToken = async (): Promise<string> => {
  const now = Date.now();
  
  // Return cached token if it's still valid (with 5 minute buffer)
  if (cachedToken && tokenExpiry > now + 300000) {
    return cachedToken;
  }

  try {
    console.log('Obtaining new Flutterwave OAuth access token...');
    
    const params = new URLSearchParams();
    params.append('client_id', env.FLW_CLIENT_ID);
    params.append('client_secret', env.FLW_CLIENT_SECRET);
    params.append('grant_type', 'client_credentials');

    const response = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Flutterwave OAuth Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(`Flutterwave OAuth error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as OAuthTokenResponse;
    
    if (!data.access_token) {
      throw new Error('No access token received from Flutterwave OAuth');
    }

    // Cache the token with expiry
    cachedToken = data.access_token;
    tokenExpiry = now + (data.expires_in * 1000); // Convert to milliseconds
    
    console.log('Flutterwave OAuth access token obtained successfully');
    return cachedToken;
  } catch (error) {
    console.error('Error obtaining Flutterwave access token:', error);
    throw error;
  }
};
