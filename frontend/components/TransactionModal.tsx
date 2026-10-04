"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  title: string;
  amount: number;
  category: string;
  description: string;
  createdAt: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingTransaction: Transaction | null;
};


export default function TransactionModal({
  isOpen,
  onClose,
  onSaved,
  editingTransaction,
}: Props) {

  const [type, setType] =
    useState<"income" | "expense">(
      "expense"
    );

  const [title, setTitle] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [saving, setSaving] =
    useState(false);


  // =====================================
  // RESET / LOAD EDIT DATA
  // =====================================

  useEffect(() => {

    if (editingTransaction) {

      setType(
        editingTransaction.type
      );

      setTitle(
        editingTransaction.title
      );

      setAmount(
        String(
          editingTransaction.amount
        )
      );

      setCategory(
        editingTransaction.category
      );

      setDescription(
        editingTransaction.description || ""
      );

    } else {

      setType("expense");
      setTitle("");
      setAmount("");
      setCategory("");
      setDescription("");

    }

  }, [
    editingTransaction,
    isOpen,
  ]);


  if (!isOpen) {
    return null;
  }


  // =====================================
  // SUBMIT
  // =====================================

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();


    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }


    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }


    if (!category) {
      alert("Please select a category.");
      return;
    }


    setSaving(true);


    try {

      const payload = {
        type,
        title: title.trim(),
        amount: Number(amount),
        category,
        description:
          description.trim(),
      };


      const url =
        editingTransaction
          ? `${API_URL}/transactions/${editingTransaction._id}`
          : `${API_URL}/transactions`;


      const response =
        await fetch(url, {
          method:
            editingTransaction
              ? "PUT"
              : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        });


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Something went wrong."
        );

        return;
      }


      // Close modal

      onClose();


      // Reload parent transactions

      onSaved();


    } catch (error) {

      console.error(error);

      alert(
        "Backend connection failed."
      );

    } finally {

      setSaving(false);

    }

  }


  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-5">

      {/* Overlay */}

      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
      />


      {/* Modal */}

      <div className="modal-card relative z-10 w-full max-w-xl">


        {/* Header */}

        <div className="mb-7 flex items-start justify-between">

          <div>

            <p className="text-xs font-bold tracking-[0.25em] text-blue-400">
              {editingTransaction
                ? "EDIT TRANSACTION"
                : "NEW TRANSACTION"}
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {editingTransaction
                ? "Update your transaction"
                : "Add a new transaction"}
            </h2>

          </div>


          <button
            onClick={onClose}
            className="close-button"
          >
            ×
          </button>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >


          {/* Type */}

          <div>

            <label className="form-label">
              Type
            </label>

            <div className="grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setType("income")
                }
                className={`type-button ${
                  type === "income"
                    ? "selected-income"
                    : ""
                }`}
              >
                ↑ Income
              </button>


              <button
                type="button"
                onClick={() =>
                  setType("expense")
                }
                className={`type-button ${
                  type === "expense"
                    ? "selected-expense"
                    : ""
                }`}
              >
                ↓ Expense
              </button>

            </div>

          </div>


          {/* Title */}

          <div>

            <label className="form-label">
              Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="e.g. Monthly salary"
              className="form-input"
            />

          </div>


          {/* Amount */}

          <div>

            <label className="form-label">
              Amount
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="Enter amount"
              className="form-input"
            />

          </div>


          {/* Category */}

          <div>

            <label className="form-label">
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
              className="form-input"
            >

              <option
                value=""
                className="bg-[#0f172a]"
              >
                Select category
              </option>

              <option
                value="Salary"
                className="bg-[#0f172a]"
              >
                💼 Salary
              </option>

              <option
                value="Freelance"
                className="bg-[#0f172a]"
              >
                💻 Freelance
              </option>

              <option
                value="Food"
                className="bg-[#0f172a]"
              >
                🍔 Food
              </option>

              <option
                value="Transport"
                className="bg-[#0f172a]"
              >
                🚗 Transport
              </option>

              <option
                value="Shopping"
                className="bg-[#0f172a]"
              >
                🛍️ Shopping
              </option>

              <option
                value="Bills"
                className="bg-[#0f172a]"
              >
                🧾 Bills
              </option>

              <option
                value="Education"
                className="bg-[#0f172a]"
              >
                📚 Education
              </option>

              <option
                value="Health"
                className="bg-[#0f172a]"
              >
                ❤️ Health
              </option>

              <option
                value="Entertainment"
                className="bg-[#0f172a]"
              >
                🎬 Entertainment
              </option>

              <option
                value="Other"
                className="bg-[#0f172a]"
              >
                📦 Other
              </option>

            </select>

          </div>


          {/* Description */}

          <div>

            <label className="form-label">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Optional description..."
              rows={3}
              className="form-input resize-none"
            />

          </div>


          {/* Submit */}

          <button
            disabled={saving}
            type="submit"
            className={`submit-button ${
              type === "income"
                ? "submit-income"
                : "submit-expense"
            }`}
          >

            {saving
              ? "Saving..."
              : editingTransaction
              ? "Update Transaction"
              : "Save Transaction"}

          </button>

        </form>

      </div>

    </div>
  );
}