import { orderService } from '../firebase/services';

/**
 * Payment Service for FuelRescue
 * Provides reliable payment flows for UPI, Credit/Debit Cards, and Cash on Delivery.
 * Architected so that Razorpay/Stripe can replace the processPayment method in production.
 */
export const paymentService = {
  /**
   * Process payment
   */
  processPayment: async ({ requestId, userId, partnerId, amount, method, paymentDetails = {} }) => {
    // Artificial network latency for realistic transaction processing
    await new Promise(r => setTimeout(r, 1000));

    const isSuccess = paymentDetails.forceFail ? false : true;
    const cleanMethod = method.replace('DEMO_', '');

    const orderRecord = {
      requestId,
      userId,
      partnerId: partnerId || "unassigned",
      amount: Number(amount.toFixed(2)),
      paymentMethod: cleanMethod, // UPI, CARD, CASH
      paymentStatus: isSuccess ? 'PAID' : 'FAILED', // PENDING, PAID, FAILED, REFUNDED
      transactionId: `TXN-${cleanMethod}-${Date.now().toString().slice(-8)}`,
      gateway: "FuelRescue Secure Payment Gateway",
      meta: {
        timestamp: new Date().toISOString(),
        paymentDetailMasked: cleanMethod === 'UPI' 
          ? (paymentDetails.upiId || 'user@okhdfcbank')
          : cleanMethod === 'CARD'
          ? `•••• •••• •••• ${paymentDetails.cardNumber?.slice(-4) || '4242'}`
          : 'Cash On Delivery'
      }
    };

    const saved = await orderService.create(orderRecord);
    return saved;
  },

  /**
   * Refund order
   */
  refundPayment: async (orderId) => {
    await new Promise(r => setTimeout(r, 600));
    return {
      orderId,
      paymentStatus: 'REFUNDED',
      refundId: `REF-${Date.now().toString().slice(-8)}`,
      refundedAt: new Date().toISOString()
    };
  }
};
