import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "../../components/Layout";
import TextLink from "../../components/TextLink";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Badge from "../../components/Badge";
import {
  CATEGORY_BADGE_BACKGROUNDS,
  CATEGORY_COLORS,
  categoriesFor,
} from "../../lib/categories";
import TypeToggle from "../../components/TypeToggle";
import { FieldLabel, TextInput, SelectInput } from "../../components/FormField";
import { useTransactions } from "../../context/TransactionsContext";
import { useClickOutside } from "../../hooks/useClickOutside";
import { formatCurrency, formatDisplayDate } from "../../lib/format";
import {
  PAYMENT_METHODS,
  paymentMethodLabel,
} from "../../lib/paymentMethods";
import { useToast } from "../../context/ToastContext";
import { TYPES } from "../../lib/typetoggle";
import type { Category, PaymentMethod } from "../../types";
import {
  withType,
  type TransactionForm,
  type TransactionFormErrors,
} from "./form";

export default function TransactionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTransaction, updateTransaction, deleteTransaction } =
    useTransactions();
  const { showToast } = useToast();
  const transaction = getTransaction(id);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<TransactionForm | null>(null);
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Set on delete so we render nothing (instead of the "not found" message)
  // during the moment between the transaction vanishing and the redirect.
  const [isDeleted, setIsDeleted] = useState(false);
  const editFormRef = useRef(null);

  useEffect(() => {
    if (transaction) {
      setForm({
        name: transaction.name,
        date: transaction.date,
        type: transaction.type,
        category: transaction.category,
        amount: String(transaction.amount),
        paymentMethod: transaction.paymentMethod,
      });
    }
  }, [transaction]);

  // While editing, show the discard-edits modal when the user clicks
  // outside the card. Paused while any modal is already open.
  useClickOutside(
    editFormRef,
    () => setIsEditOpen(true),
    isEditing && !isEditOpen && !isDeleteOpen,
  );

  if (!transaction) {
    if (isDeleted) return null;
    return (
      <Layout variant="modal">
        <p style={{ color: "var(--color-text-primary)" }}>
          This transaction doesn't exist or was already deleted.
        </p>
        <Button className="mt-6" onClick={() => navigate("/")}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Dashboard
        </Button>
      </Layout>
    );
  }

  function setField<K extends keyof TransactionForm>(
    field: K,
    value: TransactionForm[K],
  ) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function validate(currentForm: TransactionForm) {
    const nextErrors: TransactionFormErrors = {};
    if (!currentForm.name.trim()) nextErrors.name = "Name is required.";
    if (!currentForm.date) nextErrors.date = "Date is required.";
    if (!currentForm.category) nextErrors.category = "Category is required.";
    const amountNumber = Number(currentForm.amount);
    if (!currentForm.amount || Number.isNaN(amountNumber) || amountNumber <= 0) {
      nextErrors.amount = "Enter an amount greater than 0.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!transaction || !form) return;
    if (!validate(form) || form.category === "") return;
    updateTransaction(transaction.id, {
      name: form.name.trim(),
      date: form.date,
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
      paymentMethod: form.paymentMethod,
    });
    setIsEditing(false);
    showToast("Transaction updated successfully!");
  }

  function handleDelete() {
    setIsDeleteOpen(true);
  }

  function confirmDelete() {
    if (!transaction) return;
    setIsDeleted(true);
    deleteTransaction(transaction.id);
    showToast("Transaction deleted successfully!");
    navigate("/");
  }

  function discardChanges() {
    setIsEditing(false);
    setIsEditOpen(false);
    showToast("Changes discarded.");
  }

  const isExpense = transaction.type === "Expense";

  return (
    <Layout variant="modal" clickOutsideRef={editFormRef}>
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete this transaction?"
        message="This action can’t be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
      {isEditing && form ? (
        <form onSubmit={handleSave} noValidate>
          <div className="flex items-center justify-between">
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
              Edit Transaction
            </h1>
          </div>

          <div className="mt-6">
            <FieldLabel htmlFor="transaction-name">Name</FieldLabel>
            <TextInput
              id="transaction-name"
              value={form.name}
              onChange={(v) => setField("name", v)}
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
                onChange={(v) =>
                  setForm((prev) => (prev ? withType(prev, v) : prev))
                }
              />
            </div>

            <div>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <SelectInput
                id="category"
                value={form.category}
                onChange={(v) => setField("category", v as Category)}
                options={categoriesFor(form.type)}
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

          <Modal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onConfirm={discardChanges}
            title="Discard edits?"
            message="Your edits haven't been saved. Leaving now will discard them."
            confirmLabel="Discard"
            cancelLabel="Keep editing"
          />

          <div className="mt-8 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditOpen(true)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </form>
      ) : (
        <>
          <TextLink onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </TextLink>
          <div className="flex items-center justify-between">
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
              {transaction.name}
            </h1>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>Date</FieldLabel>
              {formatDisplayDate(transaction.date)}
            </div>
            <div>
              <FieldLabel>Type</FieldLabel>

              <div
                className="w-fit rounded-lg px-4 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: isExpense
                    ? "var(--color-expense-bg)"
                    : "var(--color-income-bg)",
                  color: isExpense
                    ? "var(--color-expense-text)"
                    : "var(--color-income-text)",
                }}
              >
                {transaction.type}
              </div>
            </div>

            <div>
              <FieldLabel>Category</FieldLabel>
              <Badge
                color={CATEGORY_COLORS[transaction.category]}
                backgroundColor={
                  CATEGORY_BADGE_BACKGROUNDS[transaction.category]
                }
              >
                {transaction.category}
              </Badge>
            </div>
            <div>
              <FieldLabel>Amount</FieldLabel>
              {formatCurrency(transaction.amount)}
            </div>
            <div>
              <FieldLabel>Payment method</FieldLabel>
              {paymentMethodLabel(transaction.paymentMethod)}
            </div>
          </div>

          <div className="mt-10 flex items-center justify-end">
            <div className="flex gap-3">
              <Button variant="primary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="delete" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
