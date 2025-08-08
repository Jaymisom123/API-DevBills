import dayjs from "dayjs";
import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../config/prisma";
import type { GetHistoricalTransactionsQuery } from "../../schemas/transaction.schema";
import "dayjs/locale/pt-br";
import utc from "dayjs/plugin/utc";

dayjs.locale("pt-br");
dayjs.extend(utc);

export const getHistoricalTransactions = async (
	request: FastifyRequest<{ Querystring: GetHistoricalTransactionsQuery }>,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.userId;

	if (!userId) {
		reply.status(401).send({ error: "User not authenticated" });
		return;
	}

	const { month, year, months = 6 } = request.query;

	const baseDate = new Date(year, month - 1, 1);

	const startDate = dayjs
		.utc(baseDate)
		.subtract(months - 1, "month")
		.startOf("month")
		.toDate();

	const endDate = dayjs.utc(baseDate).endOf("month").toDate();

	try {
        const transaction = await prisma.transaction.findMany({
			where: {
				userId,
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			select: {
				amount: true,
				type: true,
				date: true,
			},
		});

		const montlyData = Array.from({ length: months }, (_, i) => {
			const date = dayjs.utc(baseDate).subtract(months - 1 - i, "month");

			return {
				name: date.format("MMM/YYYY"),
				income: 0,
				expense: 0,
			};
		});

		// biome-ignore lint/complexity/noForEach: <explanation>
		transaction.forEach((transaction) => {
			const monthKey = dayjs.utc(transaction.date).format("MMM/YYYY");
			const monthData = montlyData.find((m) => m.name === monthKey);

            if (monthData) {
                if (transaction.type === "income" || transaction.type === ("INCOME" as any)) {
					monthData.income += transaction.amount;
				} else {
					monthData.expense += transaction.amount;
				}
			}
		});

		reply.send({ history: montlyData });
	} catch (err) {
		request.log.error("error in get historical transactions", err);
		reply.status(500).send({ error: "Internal Server Error" });
	}
};
