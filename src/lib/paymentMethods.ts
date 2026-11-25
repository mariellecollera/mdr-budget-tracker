import type { PaymentMethod, PaymentMethodDefinition } from "../types";

export const PAYMENT_METHODS: PaymentMethodDefinition[] = [
  { value: "cash", label: "Cash", color: "sage" },
  { value: "gcash", label: "GCash", color: "steel-blue" },
  { value: "bdo", label: "BDO", color: "navy" },
  { value: "maribank", label: "Maribank", color: "olive" },
];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = "cash";

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return PAYMENT_METHODS.some((method) => method.value === value);
}

export function paymentMethodLabel(value: PaymentMethod): string {
  return PAYMENT_METHODS.find((m) => m.value === value)?.label ?? value;
}
