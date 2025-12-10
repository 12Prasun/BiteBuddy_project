const paymentService = require('../backend/utils/paymentService');
const stripe = require('stripe');

jest.mock('stripe');

describe('Payment Service', () => {
  let mockStripeClient;

  beforeEach(() => {
    mockStripeClient = {
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn()
      },
      customers: {
        create: jest.fn(),
        retrieve: jest.fn()
      },
      paymentMethods: {
        attach: jest.fn()
      },
      refunds: {
        create: jest.fn()
      }
    };
    stripe.mockReturnValue(mockStripeClient);
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
  });

  describe('createPaymentIntent', () => {
    test('should create payment intent with valid amount', async () => {
      const mockIntent = {
        id: 'pi_test',
        amount: 10000,
        currency: 'inr',
        status: 'requires_payment_method'
      };
      mockStripeClient.paymentIntents.create.mockResolvedValue(mockIntent);

      const result = await paymentService.createPaymentIntent(100, 'test@example.com', 'order123');

      expect(result.success).toBe(true);
      expect(result.paymentIntentId).toBe('pi_test');
    });

    test('should reject zero amount', async () => {
      const result = await paymentService.createPaymentIntent(0, 'test@example.com', 'order123');

      expect(result.success).toBe(false);
    });

    test('should include metadata', async () => {
      const mockIntent = { id: 'pi_test', status: 'requires_payment_method' };
      mockStripeClient.paymentIntents.create.mockResolvedValue(mockIntent);

      await paymentService.createPaymentIntent(100, 'test@example.com', 'order123', { description: 'Test' });

      expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000,
          currency: 'inr',
          receipt_email: 'test@example.com'
        })
      );
    });

    test('should handle Stripe API errors', async () => {
      mockStripeClient.paymentIntents.create.mockRejectedValue(new Error('API Error'));

      const result = await paymentService.createPaymentIntent(100, 'test@example.com', 'order123');

      expect(result.success).toBe(false);
    });
  });

  describe('verifyPaymentIntent', () => {
    test('should verify successful payment', async () => {
      const mockIntent = {
        id: 'pi_test',
        status: 'succeeded'
      };
      mockStripeClient.paymentIntents.retrieve.mockResolvedValue(mockIntent);

      const result = await paymentService.verifyPaymentIntent('pi_test');

      expect(result.success).toBe(true);
      expect(result.status).toBe('succeeded');
    });

    test('should detect failed payment', async () => {
      const mockIntent = {
        id: 'pi_test',
        status: 'payment_failed'
      };
      mockStripeClient.paymentIntents.retrieve.mockResolvedValue(mockIntent);

      const result = await paymentService.verifyPaymentIntent('pi_test');

      expect(result.success).toBe(true);
      expect(result.status).toBe('payment_failed');
    });

    test('should handle missing payment intent', async () => {
      mockStripeClient.paymentIntents.retrieve.mockRejectedValue(
        new Error('No such payment_intent')
      );

      const result = await paymentService.verifyPaymentIntent('pi_invalid');

      expect(result.success).toBe(false);
    });
  });

  describe('refundPayment', () => {
    test('should process full refund', async () => {
      const mockRefund = {
        id: 're_test',
        amount: 10000,
        status: 'succeeded'
      };
      mockStripeClient.refunds.create.mockResolvedValue(mockRefund);

      const result = await paymentService.refundPayment('pi_test');

      expect(result.success).toBe(true);
      expect(result.refundId).toBe('re_test');
    });

    test('should process partial refund', async () => {
      const mockRefund = {
        id: 're_test',
        amount: 5000,
        status: 'succeeded'
      };
      mockStripeClient.refunds.create.mockResolvedValue(mockRefund);

      const result = await paymentService.refundPayment('pi_test', 50);

      expect(result.success).toBe(true);
    });

    test('should handle refund errors', async () => {
      mockStripeClient.refunds.create.mockRejectedValue(
        new Error('Refund failed')
      );

      const result = await paymentService.refundPayment('pi_invalid');

      expect(result.success).toBe(false);
    });
  });

  describe('createCustomer', () => {
    test('should create customer with email', async () => {
      const mockCustomer = {
        id: 'cus_test',
        email: 'test@example.com'
      };
      mockStripeClient.customers.create.mockResolvedValue(mockCustomer);

      const result = await paymentService.createCustomer('test@example.com', 'Test User');

      expect(result.success).toBe(true);
      expect(result.customerId).toBe('cus_test');
    });

    test('should handle customer creation errors', async () => {
      mockStripeClient.customers.create.mockRejectedValue(
        new Error('Customer creation failed')
      );

      const result = await paymentService.createCustomer('test@example.com');

      expect(result.success).toBe(false);
    });
  });
});
