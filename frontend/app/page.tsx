"use client";

import { useEffect, useMemo, useState } from "react";
import TransactionModal from "@/components/TransactionModal";

const API_URL = "http://localhost:5000";

type Transaction = {
  _id: string;
  type: "income" | "expense";
  title: string;
  amount: number;
  category: string;
  description: string;
  createdAt: string;
  updatedAt?: string;
};


export default function Home() {

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filterType, setFilterType] =
    useState("all");

  const [filterCategory, setFilterCategory] =
    useState("all");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);


  // =====================================
  // LOAD TRANSACTIONS
  // =====================================

  async function loadTransactions() {

    try {

      setLoading(true);
      setError("");

      const response =
        await fetch(`${API_URL}/transactions`, {
          cache: "no-store",
        });


      if (!response.ok) {
        throw new Error(
          "Failed to load transactions"
        );
      }


      const data = await response.json();


      if (!data.success) {
        throw new Error(
          data.message ||
          "Failed to load transactions"
        );
      }


      setTransactions(
        data.transactions
      );

    } catch (error) {

      console.error(error);

      setError(
        "Could not connect to the backend."
      );

    } finally {

      setLoading(false);

    }
  }


  useEffect(() => {
    loadTransactions();
  }, []);


  // =====================================
  // TOTAL INCOME
  // =====================================

  const totalIncome = useMemo(() => {

    return transactions.reduce(
      (total, transaction) => {

        if (
          transaction.type === "income"
        ) {
          return total + Number(
            transaction.amount
          );
        }

        return total;

      },
      0
    );

  }, [transactions]);


  // =====================================
  // TOTAL EXPENSE
  // =====================================

  const totalExpense = useMemo(() => {

    return transactions.reduce(
      (total, transaction) => {

        if (
          transaction.type === "expense"
        ) {
          return total + Number(
            transaction.amount
          );
        }

        return total;

      },
      0
    );

  }, [transactions]);


  // =====================================
  // BALANCE
  // =====================================

  const balance =
    totalIncome - totalExpense;


  // =====================================
  // FILTER TRANSACTIONS
  // =====================================

  const filteredTransactions =
    useMemo(() => {

      return transactions.filter(
        (transaction) => {

          const searchText =
            search.toLowerCase().trim();


          const matchesSearch =
            transaction.title
              .toLowerCase()
              .includes(searchText) ||

            transaction.category
              .toLowerCase()
              .includes(searchText) ||

            transaction.description
              .toLowerCase()
              .includes(searchText);


          const matchesType =
            filterType === "all" ||
            transaction.type === filterType;


          const matchesCategory =
            filterCategory === "all" ||
            transaction.category ===
              filterCategory;


          return (
            matchesSearch &&
            matchesType &&
            matchesCategory
          );

        }
      );

    }, [
      transactions,
      search,
      filterType,
      filterCategory,
    ]);


  // =====================================
  // DELETE
  // =====================================

  async function handleDelete(
    id: string
  ) {

    const confirmed =
      window.confirm(
        "Delete this transaction?"
      );


    if (!confirmed) return;


    try {

      const response =
        await fetch(
          `${API_URL}/transactions/${id}`,
          {
            method: "DELETE",
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        alert(
          data.message ||
          "Delete failed"
        );

        return;
      }


      // IMPORTANT
      // Immediately update state

      setTransactions(
        (current) =>
          current.filter(
            (transaction) =>
              transaction._id !== id
          )
      );

    } catch (error) {

      console.error(error);

      alert(
        "Could not connect to backend."
      );

    }
  }


  // =====================================
  // ADD
  // =====================================

  function openAddModal() {

    setEditingTransaction(null);

    setModalOpen(true);

  }


  // =====================================
  // EDIT
  // =====================================

  function openEditModal(
    transaction: Transaction
  ) {

    setEditingTransaction(
      transaction
    );

    setModalOpen(true);

  }


  // =====================================
  // FORMAT MONEY
  // =====================================

  function money(
    value: number
  ) {

    return new Intl.NumberFormat(
      "en-BD",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);

  }


  return (

    <main className="min-h-screen bg-[#070b14] text-white">

      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="orb orb-one" />

        <div className="orb orb-two" />

        <div className="orb orb-three" />

      </div>


      <div className="relative z-10 mx-auto max-w-7xl px-5 py-8 md:px-8">


        {/* =================================
            HEADER
        ================================= */}

        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="logo-box">
                $
              </div>

              <div>

                <h1 className="text-2xl font-black tracking-widest">
                  LUMORA
                </h1>

                <p className="text-xs tracking-[0.3em] text-gray-500">
                  FINANCE
                </p>

              </div>

            </div>

          </div>


          <button
            onClick={openAddModal}
            className="primary-button"
          >
            <span className="text-xl">+</span>
            Add Transaction
          </button>

        </header>


        {/* =================================
            HERO
        ================================= */}

        <section className="mb-10">

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            Personal Finance Dashboard
          </p>

          <h2 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">

            Take control of your

            <span className="gradient-text">
              {" "}money.
            </span>

          </h2>

          <p className="mt-5 max-w-2xl text-gray-400">
            Track every income and expense,
            understand your spending and keep
            your finances organized.
          </p>

        </section>


        {/* =================================
            ERROR
        ================================= */}

        {error && (

          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">

            {error}

            <button
              onClick={loadTransactions}
              className="ml-4 underline"
            >
              Retry
            </button>

          </div>

        )}


        {/* =================================
            STATS
        ================================= */}

        <section className="mb-10 grid gap-5 md:grid-cols-3">


          {/* BALANCE */}

          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon balance-icon">
                ◈
              </div>

              <span className="stat-label">
                BALANCE
              </span>

            </div>

            <p className="stat-title">
              Current Balance
            </p>

            <h3
              className={`stat-value ${
                balance >= 0
                  ? "text-white"
                  : "text-red-400"
              }`}
            >
              ৳ {money(balance)}
            </h3>

            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5">

              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700"
                style={{
                  width:
                    totalIncome > 0
                      ? `${Math.min(
                          100,
                          Math.max(
                            0,
                            (balance /
                              totalIncome) *
                              100
                          )
                        )}%`
                      : "0%",
                }}
              />

            </div>

          </div>


          {/* INCOME */}

          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon income-icon">
                ↑
              </div>

              <span className="stat-label income-label">
                INCOME
              </span>

            </div>

            <p className="stat-title">
              Total Income
            </p>

            <h3 className="stat-value text-emerald-400">
              ৳ {money(totalIncome)}
            </h3>

            <p className="mt-3 text-xs text-gray-500">
              Money coming in
            </p>

          </div>


          {/* EXPENSE */}

          <div className="stat-card">

            <div className="stat-top">

              <div className="stat-icon expense-icon">
                ↓
              </div>

              <span className="stat-label expense-label">
                EXPENSE
              </span>

            </div>

            <p className="stat-title">
              Total Expense
            </p>

            <h3 className="stat-value text-rose-400">
              ৳ {money(totalExpense)}
            </h3>

            <p className="mt-3 text-xs text-gray-500">
              Money going out
            </p>

          </div>

        </section>


        {/* =================================
            TRANSACTIONS
        ================================= */}

        <section className="dashboard-panel">


          {/* Header */}

          <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                Activity
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                Transaction History
              </h2>

            </div>


            <div className="flex flex-col gap-3 md:flex-row">

              {/* Search */}

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search..."
                className="input-control"
              />


              {/* Type */}

              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value
                  )
                }
                className="input-control"
              >

                <option
                  value="all"
                  className="bg-[#0f172a]"
                >
                  All Types
                </option>

                <option
                  value="income"
                  className="bg-[#0f172a]"
                >
                  Income
                </option>

                <option
                  value="expense"
                  className="bg-[#0f172a]"
                >
                  Expense
                </option>

              </select>


              {/* Category */}

              <select
                value={filterCategory}
                onChange={(e) =>
                  setFilterCategory(
                    e.target.value
                  )
                }
                className="input-control"
              >

                <option
                  value="all"
                  className="bg-[#0f172a]"
                >
                  All Categories
                </option>

                <option
                  value="Food"
                  className="bg-[#0f172a]"
                >
                  Food
                </option>

                <option
                  value="Transport"
                  className="bg-[#0f172a]"
                >
                  Transport
                </option>

                <option
                  value="Shopping"
                  className="bg-[#0f172a]"
                >
                  Shopping
                </option>

                <option
                  value="Bills"
                  className="bg-[#0f172a]"
                >
                  Bills
                </option>

                <option
                  value="Salary"
                  className="bg-[#0f172a]"
                >
                  Salary
                </option>

                <option
                  value="Freelance"
                  className="bg-[#0f172a]"
                >
                  Freelance
                </option>

                <option
                  value="Education"
                  className="bg-[#0f172a]"
                >
                  Education
                </option>

                <option
                  value="Health"
                  className="bg-[#0f172a]"
                >
                  Health
                </option>

                <option
                  value="Other"
                  className="bg-[#0f172a]"
                >
                  Other
                </option>

              </select>

            </div>

          </div>


          {/* Loading */}

          {loading ? (

            <div className="py-24 text-center">

              <div className="loader" />

              <p className="mt-5 text-gray-500">
                Loading your finances...
              </p>

            </div>

          ) : filteredTransactions.length === 0 ? (

            <div className="empty-state">

              <div className="mb-5 text-6xl opacity-30">
                ◇
              </div>

              <h3 className="text-xl font-bold">
                No transactions yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Add your first income or expense.
              </p>

              <button
                onClick={openAddModal}
                className="secondary-button mt-6"
              >
                + Create Transaction
              </button>

            </div>

          ) : (

            <div className="space-y-3">

              {filteredTransactions.map(
                (
                  transaction,
                  index
                ) => (

                  <article
                    key={transaction._id}
                    className="transaction-row"
                    style={{
                      animationDelay:
                        `${index * 50}ms`,
                    }}
                  >

                    {/* Icon */}

                    <div
                      className={`transaction-icon ${
                        transaction.type ===
                        "income"
                          ? "income-icon"
                          : "expense-icon"
                      }`}
                    >

                      {transaction.type ===
                      "income"
                        ? "↑"
                        : "↓"}

                    </div>


                    {/* Details */}

                    <div className="min-w-0 flex-1">

                      <h3 className="truncate font-bold">
                        {transaction.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">

                        <span className="category-badge">
                          {transaction.category}
                        </span>

                        <span className="date-text">
                          {new Date(
                            transaction.createdAt
                          ).toLocaleDateString(
                            "en-BD",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>

                      </div>

                    </div>


                    {/* Amount */}

                    <div className="text-right">

                      <p
                        className={`text-lg font-black ${
                          transaction.type ===
                          "income"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >

                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}
                        ৳{" "}
                        {money(
                          transaction.amount
                        )}

                      </p>

                    </div>


                    {/* Actions */}

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          openEditModal(
                            transaction
                          )
                        }
                        className="action-edit"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            transaction._id
                          )
                        }
                        className="action-delete"
                      >
                        Delete
                      </button>

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </section>


        <footer className="py-10 text-center text-xs tracking-widest text-gray-600">
          LUMORA • PERSONAL FINANCE
        </footer>

      </div>


      {/* MODAL */}

      <TransactionModal
        isOpen={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSaved={loadTransactions}
        editingTransaction={
          editingTransaction
        }
      />

    </main>
  );
}