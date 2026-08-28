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
    const payload = {
      tx_ref: params.txRef,
      amount: params.amount,
      currency: 'NGN', // Can change or customize
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
      throw new Error(`Flutterwave initialisation error: ${JSON.stringify(errorData)}`);
    }

    const resJson = await response.json() as {
      status: string;
      message: string;
      data: {
        link: string;
      };
    };

    if (resJson.status !== 'success' || !resJson.data?.link) {
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
): Promise<{ status: string; amount: number; txRef: string }> => {
  try {
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Flutterwave verification error: ${JSON.stringify(errorData)}`);
    }

    const resJson = await response.json() as {
      status: string;
      message: string;
      data: {
        id: number;
        status: string;
        amount: number;
        tx_ref: string;
      };
    };

    if (resJson.status !== 'success' || !resJson.data) {
      throw new Error(resJson.message || 'Failed to verify transaction');
    }

    return {
      status: resJson.data.status,
      amount: resJson.data.amount,
      txRef: resJson.data.tx_ref,
    };
  } catch (error) {
    console.error('verifyFlutterwavePayment error:', error);
    throw error;
  }
};
