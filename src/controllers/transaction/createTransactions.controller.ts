import type { FastifyReply, FastifyRequest } from "fastify";

import prisma from "../../config/prisma.js";
import { createTransactionSchema } from "../../schemas/transaction.schema.js";

export const createTransaction = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.userId;

	if (!userId) {
		reply.status(401).send({ error: "Usuário não autenticado" });
		return;
	}

	// 🛡️ Validação com Zod (usando safeParse para tratar erros)
	const result = createTransactionSchema.safeParse(request.body);

	if (!result.success) {
		const message = result.error.errors[0]?.message || "Erro de validação";
		reply.status(400).send({ error: message });
		return;
	}

	// ✅ Dados validados e tipados
	const transaction = result.data;

	try {
		const parsedDate = new Date(transaction.date);

		const category = await prisma.category.findFirst({
			where: {
				id: transaction.categoryId,
				type: transaction.type,
			},
		});

		if (!category) {
			reply.status(404).send({ error: "Categoria inválida" });
			return;
		}

		const newTransaction = await prisma.transaction.create({
			data: {
				...transaction,
				userId,
				date: parsedDate,
			},
			include: {
				category: true,
			},
		});

		reply.status(201).send(newTransaction);
	} catch (error) {
		request.log.error("Erro ao criar transação:", error);
		reply.status(500).send({ error: "Erro interno do servidor" });
	}
};
