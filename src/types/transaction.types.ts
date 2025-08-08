import type { TransactionType } from "@prisma/client";
import type { CategorySummary } from "./catgory.types";

export interface TransactionDTO {
	id?: string;
	description: string;
	amount: number;
	date: Date | string;
	type: TransactionType;
	categoryId: string;
	userId?: string;
}

export interface CreateTransactionRoute {
	Body: CreateTransactionDTO;
}

export interface CreateTransactionDTO {
	description: string;
	amount: number;
	date: string | Date;
	categoryId: string;
	type: TransactionType;
}

export interface TransactionSummary {
	totalExpenses: number;
	totalIncomes: number;
	balance: number;
	expensesByCategory: CategorySummary[];
}

export interface TransactionFilters {
	userId: string;
	date?: {
		gte: Date;
		lte: Date;
	};
	type?: TransactionType;
	categoryId?: string;
}
