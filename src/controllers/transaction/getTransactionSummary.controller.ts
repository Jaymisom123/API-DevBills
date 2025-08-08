import { TransactionType } from "@prisma/client";
import dayjs from "dayjs";
import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../config/prisma.js";
import type { CategorySummary } from "../../types/catgory.types.js";
import type { TransactionSummary } from "../../types/transaction.types.js";

interface SummaryQuery {
	month: string;
	year: string;
}

export const getTransactionSummary = async (
	request: FastifyRequest<{ Querystring: SummaryQuery }>,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.userId;

	if (!userId) {
		reply.status(401).send({ error: "Usuário não autenticado" });
		return;
	}

	const { month, year } = request.query;

	// Validação de entrada básica
	if (!month || !year) {
		reply.status(400).send({ error: "Mês e ano são obrigatórios" });
		return;
	}

	// Criar range de datas com dayjs
	const startDate = dayjs(`${year}-${month}-01`).startOf("month").toDate();
	const endDate = dayjs(startDate).endOf("month").toDate();

	try {
		// Buscar transações do período
		const transactions = await prisma.transaction.findMany({
			where: {
				userId,
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			include: {
				category: true,
			},
		});

		// Iniciar totais
		let totalExpenses = 0;
		let totalIncomes = 0;
		const groupedExpenses = new Map<string, CategorySummary>();

        // Agrupar por categoria (protegendo contra categoria ausente)
        for (const transaction of transactions) {
            if (transaction.type === TransactionType.expense) {
                totalExpenses += transaction.amount;

                // Se a categoria não existir (dado órfão), ignora com segurança
                if (!transaction.category) {
                    continue;
                }

                const existing = groupedExpenses.get(transaction.categoryId) ?? {
                    categoryId: transaction.category.id,
                    categoryName: transaction.category.name,
                    categoryColor: transaction.category.color,
                    amount: 0,
                    percentage: 0,
                };

                existing.amount += transaction.amount;
                groupedExpenses.set(transaction.categoryId, existing);
            } else {
                totalIncomes += transaction.amount;
            }
        }

		// Montar resposta com porcentagens e ordenação
		const summary: TransactionSummary = {
			totalExpenses,
			totalIncomes,
			balance: totalIncomes - totalExpenses,
            expensesByCategory: Array.from(groupedExpenses.values())
                .map((entry) => ({
                    ...entry,
                    // Evita divisão por zero quando não há despesas
                    percentage:
                        totalExpenses > 0
                            ? Number.parseFloat(
                                  ((entry.amount / totalExpenses) * 100).toFixed(2),
                              )
                            : 0,
                }))
                .sort((a, b) => b.amount - a.amount),
		};

		reply.send(summary);
	} catch (error) {
		request.log.error("Erro ao gerar resumo:", error);
		reply.status(500).send({ error: "Erro ao gerar resumo" });
	}
};
