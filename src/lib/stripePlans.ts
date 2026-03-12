// Stripe price IDs for SME customer plans
export const STRIPE_PLANS = {
  starter: {
    monthly: {
      price_id: "price_1T8pqt4BZWR0QeSaNI4bx1rT",
      price: 149,
      interval: "mes",
    },
    yearly: {
      price_id: "price_1T8prL4BZWR0QeSaZ3TOwCtv",
      price: 1430,
      interval: "año",
    },
  },
  pro: {
    monthly: {
      price_id: "price_1T8q5c4BZWR0QeSaL8G0ZqsI",
      price: 299,
      interval: "mes",
    },
    yearly: {
      price_id: "price_1T8q604BZWR0QeSaIpXTw52w",
      price: 2870,
      interval: "año",
    },
  },
} as const;

export type PlanTier = keyof typeof STRIPE_PLANS;
export type BillingInterval = "monthly" | "yearly";
