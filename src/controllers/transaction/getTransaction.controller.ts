import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../config/prisma.js";
import type { GetTransactionsQuery } from "../../schemas/transaction.schema.js";
import type { TransactionFilters } from "../../types/transaction.types.js";

dayjs.extend(utc);

export const getTransactions = async (
	request: FastifyRequest<{ Querystring: GetTransactionsQuery }>,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.userId;

	if (!userId) {
		reply.status(401).send({ error: "User not authenticated" });
		return;
	}

	const { month, year, type, categoryId } = request.query;

	const filters: TransactionFilters = { userId };

	if (month && year) {
		const startDate = dayjs
			.utc(`${year}-${month}-01`)
			.startOf("month")
			.toDate();
		const endDate = dayjs.utc(startDate).endOf("month").toDate();

		filters.date = {
			gte: startDate,
			lte: endDate,
		};
	}

	if (type) {
		filters.type = type;
	}

	if (categoryId) {
		filters.categoryId = categoryId;
	}

	try {
        const transactions = await prisma.transaction.findMany({
			where: filters,
			orderBy: {
				date: "desc",
			},
			include: {
				category: {
					select: {
						color: true,
						name: true,
						type: true,
					},
				},
			},
		});
		reply.send(transactions);
    } catch (error) {
        request.log.error({ error }, "error in getTransactions");
        reply.status(500).send({ error: "Internal Server Error" });
    }
};
