import { apiFetch } from './client';
import type {
  SubscriptionResponse, InvoiceResponse,
  CheckoutResponse, PortalSessionResponse,
  SubscriptionCheckoutRequest,
} from '../types';

const PAY = process.env.NEXT_PUBLIC_PAYMENT_URL!;

export const getSubscription = (userId: string) =>
  apiFetch<SubscriptionResponse>(PAY, `/subscriptions/me?user_id=${userId}`);

export const createCheckout = (data: SubscriptionCheckoutRequest) =>
  apiFetch<CheckoutResponse>(PAY, '/checkout/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const createPortalSession = (userId: string) =>
  apiFetch<PortalSessionResponse>(PAY, '/billing/portal', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });

export const listInvoices = (userId: string, limit = 10) =>
  apiFetch<InvoiceResponse[]>(PAY, `/billing/invoices?user_id=${userId}&limit=${limit}`);

export const cancelSubscription = (userId: string) =>
  apiFetch<SubscriptionResponse>(PAY, '/subscriptions/cancel', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
