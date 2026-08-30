import { env } from '../config/env';

interface InitializePaymentParams {
  amount: number;
  txRef: string;
  customer: {
    email: string;
    name: string;
  };
  items: any[];
  userId: string;
}

const PADDLE_SANDBOX_API = 'https://sandbox-api.paddle.com';
const PADDLE_PRODUCTION_API = 'https://api.paddle.com';

const getPaddleApiKey = (): string => {
  const paddleEnv = env.PADDLE_ENVIRONMENT || env.PADDLE_ENV || 'sandbox';
  if (env.PADDLE_API_KEY) return env.PADDLE_API_KEY;
  return paddleEnv === 'sandbox'
    ? env.PADDLE_SANDBOX_API_KEY || ''
    : env.PADDLE_PRODUCTION_API_KEY || '';
};

const getPaddleApiUrl = (): string => {
  const paddleEnv = env.PADDLE_ENVIRONMENT || env.PADDLE_ENV || 'sandbox';
  return paddleEnv === 'sandbox' ? PADDLE_SANDBOX_API : PADDLE_PRODUCTION_API;
};

export const initializePaddlePayment = async (params: InitializePaymentParams): Promise<{ transactionId: string }> => {
  try {
    const apiKey = getPaddleApiKey();
    const apiUrl = getPaddleApiUrl();

    // Convert amount to cents (Paddle uses smallest denomination)
    const amountInCents = Math.round(params.amount * 100);

    // Create transaction with non-catalog item for dynamic pricing
    const transactionPayload = {
      items: [
        {
          quantity: 1,
          price: {
            description: 'Custom Pizza Order',
            name: 'Custom Pizza',
            billing_cycle: null, // One-time purchase
            tax_mode: 'account_setting',
            unit_price: {
              amount: amountInCents.toString(),
              currency_code: 'USD',
            },
            product: {
              name: 'DailyPizza Custom Order',
              description: 'Custom-built pizza order',
              tax_category: 'standard',
            },
          },
        },
      ],
      customer: {
        email: params.customer.email,
        name: params.customer.name,
      },
      custom_data: {
        txRef: params.txRef,
        items: params.items,
        totalPrice: params.amount,
        userId: params.userId,
      },
    };

    const endpoint = `${apiUrl}/transactions`;
    console.log('Paddle Transaction Create Request:', {
      endpoint,
      method: 'POST',
      environment: env.PADDLE_ENVIRONMENT,
      payload: JSON.stringify(transactionPayload, null, 2),
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(transactionPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Paddle Transaction API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData: JSON.stringify(errorData, null, 2),
      });
      throw new Error(`Paddle API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const resJson = await response.json() as {
      data: {
        id: string;
        status: string;
        currency_code: string;
        totals: {
          total: string;
        };
      };
    };

    console.log('Paddle Transaction Response:', {
      transactionId: resJson.data?.id,
      status: resJson.data?.status,
      currency: resJson.data?.currency_code,
      total: resJson.data?.totals?.total,
    });

    if (!resJson.data || !resJson.data.id) {
      console.error('Paddle transaction creation failed:', resJson);
      throw new Error('Failed to create Paddle transaction');
    }

    return {
      transactionId: resJson.data.id,
    };
  } catch (error) {
    console.error('initializePaddlePayment error:', error);
    throw error;
  }
};

export const verifyPaddlePayment = async (
  transactionId: string
): Promise<{ status: string; currency: string }> => {
  try {
    const apiKey = getPaddleApiKey();
    const apiUrl = getPaddleApiUrl();

    const endpoint = `${apiUrl}/transactions/${transactionId}`;
    console.log('Paddle Transaction Verification Request:', {
      endpoint,
      method: 'GET',
      transactionId,
    });

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Paddle Transaction Verification API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorData: JSON.stringify(errorData, null, 2),
      });
      throw new Error(`Paddle verification error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const resJson = await response.json() as {
      data: {
        id: string;
        status: string;
        currency_code: string;
      };
    };

    console.log('Paddle Transaction Verification Response:', {
      transactionId: resJson.data?.id,
      status: resJson.data?.status,
      currency: resJson.data?.currency_code,
    });

    if (!resJson.data || !resJson.data.id) {
      console.error('Paddle transaction verification failed:', resJson);
      throw new Error('Failed to verify Paddle transaction');
    }

    return {
      status: resJson.data.status,
      currency: resJson.data.currency_code,
    };
  } catch (error) {
    console.error('verifyPaddlePayment error:', error);
    throw error;
  }
};
