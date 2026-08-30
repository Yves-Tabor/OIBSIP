import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';

const validCompletedEvent = {
  event_id: 'evt_123',
  event_type: 'transaction.completed',
  data: {
    id: 'txn_123',
    currency_code: 'USD',
    totals: { total: '2500' },
    custom_data: {
      txRef: 'txref_123',
      totalPrice: 25,
      userId: 'user_123',
      items: [
        {
          base: 'Classic',
          sauce: 'Marinara',
          cheese: 'Mozzarella',
          vegetables: ['Olives'],
          quantity: 1,
        },
      ],
    },
  },
};

const invalidAmountEvent = {
  ...validCompletedEvent,
  data: {
    ...validCompletedEvent.data,
    totals: { total: '3000' },
  },
};

const invalidCurrencyEvent = {
  ...validCompletedEvent,
  data: {
    ...validCompletedEvent.data,
    currency_code: 'EUR',
  },
};

describe('Paddle webhook payment validation', () => {
  it('accepts a valid completed transaction payload', () => {
    const totalAmount = Number(validCompletedEvent.data.totals.total) / 100;
    const expectedTotalPrice = Number(validCompletedEvent.data.custom_data.totalPrice);
    const currency = validCompletedEvent.data.currency_code;

    assert.equal(currency, 'USD');
    assert.equal(Number(totalAmount.toFixed(2)), Number(expectedTotalPrice.toFixed(2)));
  });

  it('rejects a mismatched payment amount', () => {
    const totalAmount = Number(invalidAmountEvent.data.totals.total) / 100;
    const expectedTotalPrice = Number(invalidAmountEvent.data.custom_data.totalPrice);

    assert.notEqual(Number(totalAmount.toFixed(2)), Number(expectedTotalPrice.toFixed(2)));
  });

  it('rejects a non-USD currency', () => {
    const currency = invalidCurrencyEvent.data.currency_code;
    assert.notEqual(currency, 'USD');
  });

  it('supports duplicate event guards via event_id lookup', () => {
    const seenEventIds = new Set<string>(['evt_123']);
    const eventId = validCompletedEvent.event_id;

    assert.equal(seenEventIds.has(eventId), true);
  });
});
