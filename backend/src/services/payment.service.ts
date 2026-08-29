import { env } from '../config/env';

interface InitializePaymentParams {
  amount: number;
  txRef: string;
  customer: {
    email: string;
    name: string;
  };
}

export const initializeFlutterwavePayment = async (params: InitializePaymentParams): Promise<string> => {
  try {
    // Log Flutterwave secret key verification (without exposing the actual key)
    const secretKey = env.FLUTTERWAVE_SECRET_KEY;
    console.log('Flutterwave Secret Key Verification:', {
      exists: !!secretKey,
      length: secretKey?.length || 0,
      startsWithFLWSECK_TEST: secretKey?.startsWith('FLWSECK_TEST-') || false,
    });

    const payload = {
      tx_ref: params.txRef,
      amount: params.amount,
      currency: 'USD',
      redirect_url: `${env.FRONTEND_URL}/menu`,
      customer: {
        email: params.customer.email,
        name: params.customer.name,
      },
      customizations: {
        title: 'DailyPizza Payment',
        description: 'Secure payment for custom pizza order',
      },
    };

    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Flutterwave API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(`Flutterwave API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const resJson = await response.json() as {
      status: string;
      message: string;
      data: {
        link: string;
      };
    };

    if (resJson.status !== 'success' || !resJson.data?.link) {
      console.error('Flutterwave initialization failed:', resJson);
      throw new Error(resJson.message || 'Failed to initialize payment link');
    }

    return resJson.data.link;
  } catch (error) {
    console.error('initializeFlutterwavePayment error:', error);
    throw error;
  }
};

export const verifyFlutterwavePayment = async (
  transactionId: string
): Promise<{ status: string; amount: number; txRef: string; currency: string }> => {
  try {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Flutterwave Verification API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(`Flutterwave verification error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const resJson = await response.json() as {
      status: string;
      message: string;
      data: {
        id: number;
        status: string;
        amount: number;
        tx_ref: string;
        currency: string;
      };
    };

    if (resJson.status !== 'success' || !resJson.data) {
      console.error('Flutterwave verification failed:', resJson);
      throw new Error(resJson.message || 'Failed to verify transaction');
    }

    return {
      status: resJson.data.status,
      amount: resJson.data.amount,
      txRef: resJson.data.tx_ref,
      currency: resJson.data.currency,
    };
  } catch (error) {
    console.error('verifyFlutterwavePayment error:', error);
    throw error;
  }
};
