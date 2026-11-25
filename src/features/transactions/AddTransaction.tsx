import { useRef, useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import TypeToggle from "../../components/TypeToggle";
import { FieldLabel, TextInput, SelectInput } from "../../components/FormField";
import { useTransactions } from "../../context/TransactionsContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import { categoriesFor } from "../../lib/categories";
import { todayISO } from "../../lib/format";
import {
  DEFAULT_PAYMENT_METHOD,
  PAYMENT_METHODS,
} from "../../lib/paymentMethods";
import { useToast } from "../../context/ToastContext";
import { TYPES } from "../../lib/typetoggle";
import type { Category, PaymentMethod } from "../../types";
import {
  withType,
  type TransactionForm,
  type TransactionFormErrors,
} from "./form";

const EMPTY_FORM: TransactionForm = {
  name: "",
  date: todayISO(),
  type: "Expense",
  category: "",
  amount: "",
  paymentMethod: DEFAULT_PAYMENT_METHOD,
};

export default function AddTransaction() {
  const { addTransaction } = useTransactions();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<TransactionForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cardRef = useRef(null);

  function setField<K extends keyof TransactionForm>(
    field: K,
    value: TransactionForm[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    const nextErrors: TransactionFormErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.date) nextErrors.date = "Date is required.";
    if (!form.category) nextErrors.category = "Category is required.";
    const amountNumber = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNumber) || amountNumber <= 0) {
      nextErrors.amount = "Enter an amount greater than 0.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate() || form.category === "") return;

    addTransaction({
      name: form.name.trim(),
      date: form.date,
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
    });
    showToast("Transaction added successfully!");
    navigate("/");
  }

  function handleDiscard() {
    setIsModalOpen(true);
  }

  useClickOutside(cardRef, handleDiscard, !isModalOpen);

  return (
    <Layout variant="modal" clickOutsideRef={cardRef}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => navigate("/")}
        title="Discard this transaction?"
        message="Your entries haven't been saved. Leaving now will discard them."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
      />

      <form onSubmit={handleSubmit} noValidate>
        <h1
          className="font-display text-xl font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          <span
            className="mr-3 inline-block w-1 align-middle"
            style={{
              height: "1.1em",
              backgroundColor: "var(--color-btn-primary-bg)",
            }}
          />
          New Transaction
        </h1>

        <div className="mt-6">
          <FieldLabel htmlFor="transaction-name">Name</FieldLabel>
          <TextInput
            id="transaction-name"
            value={form.name}
            onChange={(v) => setField("name", v)}
            placeholder="e.g. Grocery Run"
            error={errors.name}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="date">Date</FieldLabel>
            <TextInput
              id="date"
              type="date"
              value={form.date}
              onChange={(v) => setField("date", v)}
              error={errors.date}
            />
          </div>
          <div>
            <TypeToggle
              label="Type"
              choices={TYPES}
              value={form.type}
              onChange={(v) => setForm((prev) => withType(prev, v))}
            />
          </div>

          <div>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <SelectInput
              id="category"
              value={form.category}
              onChange={(v) => setField("category", v as Category)}
              options={categoriesFor(form.type)}
              placeholder="Select a category"
              error={errors.category}
            />
          </div>
          <div>
            <FieldLabel htmlFor="amount">Amount</FieldLabel>
            <TextInput
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(v) => setField("amount", v)}
              placeholder="0.00"
              error={errors.amount}
            />
          </div>
          <div>
            <FieldLabel htmlFor="payment-method">Payment method</FieldLabel>
            <SelectInput
              id="payment-method"
              value={form.paymentMethod}
              onChange={(v) => setField("paymentMethod", v as PaymentMethod)}
              options={PAYMENT_METHODS}
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p
              className="text-sm italic"
              style={{ color: "var(--color-text-muted)" }}
            >
              "Tame thy tempers." – Kier Eagan
            </p>
          </div>

          <div className="flex gap-3 self-end sm:self-auto">
            <Button type="submit" variant="primary">
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={handleDiscard}>
              Discard
            </Button>
          </div>
        </div>
      </form>
    </Layout>
  );
}
