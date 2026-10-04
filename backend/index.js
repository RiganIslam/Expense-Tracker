const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");

dotenv.config();

const app = express();

const PORT = 5000;

const client = new MongoClient(process.env.MONGODB_URI);

let transactionsCollection;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running",
  });
});

// ===============================
// GET ALL TRANSACTIONS
// ===============================

app.get("/transactions", async (req, res) => {
  try {
    const transactions = await transactionsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("GET TRANSACTIONS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get transactions",
    });
  }
});

// ===============================
// GET SINGLE TRANSACTION
// ===============================

app.get("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("GET SINGLE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get transaction",
    });
  }
});

// ===============================
// CREATE TRANSACTION
// ===============================

app.post("/transactions", async (req, res) => {
  try {
    const {
      type,
      title,
      amount,
      category,
      description,
    } = req.body;

    // Validate type
    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        success: false,
        message: "Type must be income or expense",
      });
    }

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    // Validate amount
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Validate category
    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const newTransaction = {
      type,
      title: title.trim(),
      amount: numericAmount,
      category: category.trim(),
      description: description?.trim() || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await transactionsCollection.insertOne(
      newTransaction
    );

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction: {
        _id: result.insertedId,
        ...newTransaction,
      },
    });
  } catch (error) {
    console.error("CREATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
    });
  }
});

// ===============================
// UPDATE TRANSACTION
// ===============================

app.put("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const {
      type,
      title,
      amount,
      category,
      description,
    } = req.body;

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type",
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const updatedTransaction = {
      type,
      title: title.trim(),
      amount: numericAmount,
      category: category.trim(),
      description: description?.trim() || "",
      updatedAt: new Date(),
    };

    const result = await transactionsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: updatedTransaction,
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const transaction = await transactionsCollection.findOne({
      _id: new ObjectId(id),
    });

    res.json({
      success: true,
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
    });
  }
});

// ===============================
// DELETE TRANSACTION
// ===============================

app.delete("/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const result = await transactionsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
    });
  }
});

// ===============================
// START SERVER
// ===============================

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing from .env file"
      );
    }

    await client.connect();

    console.log("✅ MongoDB connected");

    const db = client.db("expenseTrackerDB");

    transactionsCollection =
      db.collection("transactions");

    console.log("✅ Database ready");

    app.listen(PORT, () => {
      console.log(
        `🚀 Server running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("❌ SERVER ERROR:");
    console.error(error);
  }
}

startServer();