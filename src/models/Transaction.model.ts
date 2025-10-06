import mongoose, { InferSchemaType, Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["expense", "income"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },

    // Expense-specific fields
    category: {
      type: String,
    },

    // Income-specific fields
    source: {
      type: String,
    },

    merchant: {
      type: String,
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    recurringId: {
      type: Schema.Types.ObjectId,
      ref: "Recurring",
    },
  },
  { timestamps: true }
);

export type ITransaction = InferSchemaType<typeof TransactionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
