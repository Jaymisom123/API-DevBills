import type { FastifyInstance } from "fastify";
import { zodToJsonSchema } from "zod-to-json-schema";

import { createTransaction } from "../controllers/transaction/createTransactions.controller.js";
import { deleteTransaction } from "../controllers/transaction/deleteTransaction.controller.js";
import { getTransactions } from "../controllers/transaction/getTransaction.controller.js";

import { getHistoricalTransactions } from "../controllers/transaction/getHistoricalTransaction.controller.js";
import { getTransactionSummary } from "../controllers/transaction/getTransactionSummary.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
// 🧠 Importa schemas Zod
import {
	createTransactionSchema,
	deleteTransactionSchema,
	getHistoricalTransactionSchema,
	getTransactionSummarySchema,
	getTransactionsSchema,
} from "../schemas/transaction.schema.js";

// 🧠 Converte schemas Zod para JSON Schema do Fastify

export default async function transactionRoutes(
	fastify: FastifyInstance,
): Promise<void> {
	// Aplica middleware global de autenticação
	fastify.addHook("preHandler", authMiddleware);

	// 📌 Criar transação
	fastify.route({
		method: "POST",
		url: "/",
		schema: {
			body: zodToJsonSchema(createTransactionSchema),
		},
		handler: createTransaction,
	});

	// 📌 Buscar transações
	fastify.route({
		method: "GET",
		url: "/",
		schema: {
			querystring: zodToJsonSchema(getTransactionsSchema),
		},
		handler: getTransactions,
	});

	// 📌 Resumo
	fastify.route({
		method: "GET",
		url: "/summary",
		schema: {
			querystring: zodToJsonSchema(getTransactionSummarySchema),
		},
		handler: getTransactionSummary,
	});

	// 📌 Excluir
	fastify.route({
		method: "DELETE",
		url: "/:id",
		schema: {
			params: zodToJsonSchema(deleteTransactionSchema),
		},
		handler: deleteTransaction,
	});

	//Historico

	fastify.route({
		method: "GET",
		url: "/historical",
		schema: {
			querystring: zodToJsonSchema(getHistoricalTransactionSchema),
		},
		handler: getHistoricalTransactions,
	});
}
