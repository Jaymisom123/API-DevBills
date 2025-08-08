import { TransactionType } from "@prisma/client";
import { ObjectId } from "mongodb";
import { z } from "zod";

const isValidObjectId = (id: string): boolean => ObjectId.isValid(id);

export const createTransactionSchema = z.object({
	description: z.string().min(1, "Description is required"),
	amount: z.number().positive("Amount must be positive"),
	date: z.coerce.date({
		errorMap: () => ({ message: "Invalid date format" }),
	}),
	categoryId: z.string().refine(isValidObjectId, {
		message: "Invalid categoryId",
	}),
	type: z.enum([TransactionType.expense, TransactionType.income], {
		errorMap: () => ({ message: "Invalid transaction type" }),
	}),
});

export const getTransactionsSchema = z.object({
	month: z.string().optional(),
	year: z.string().optional(),
	type: z
		.enum([TransactionType.expense, TransactionType.income], {
			errorMap: () => ({ message: "Invalid transaction type" }),
		})
		.optional(),
	categoryId: z
		.string()
		.refine(isValidObjectId, {
			message: "Invalid categoryId",
		})
		.optional(),
});

export const getTransactionSummarySchema = z.object({
	month: z.string({ required_error: "The month is required" }),
	year: z.string({ required_error: "The year is required" }),
});

export const getHistoricalTransactionSchema = z.object({
	month: z.coerce.number().min(1).max(12, "Invalid month"),
	year: z.coerce.number().min(2000).max(2100, "Invalid year"),
	months: z.coerce.number().min(1).max(12, "Invalid months").optional(),
});

export const deleteTransactionSchema = z.object({
	id: z.string().refine(isValidObjectId, {
		message: "Invalid id",
	}),
});

export type GetHistoricalTransactionsQuery = z.infer<
	typeof getHistoricalTransactionSchema
>;
export type CreateTransactionBody = z.infer<typeof createTransactionSchema>;
export type GetTransactionsQuery = z.infer<typeof getTransactionsSchema>;
export type GetTransactionSummaryQuery = z.infer<
	typeof getTransactionSummarySchema
>;
export type DeleteTransactionParams = z.infer<typeof deleteTransactionSchema>;
