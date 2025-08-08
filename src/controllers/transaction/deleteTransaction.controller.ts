import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../../config/prisma.js";
import type { DeleteTransactionParams } from "../../schemas/transaction.schema.js";

export const deleteTransaction = async (
	request: FastifyRequest<{ Params: DeleteTransactionParams }>,
	reply: FastifyReply,
): Promise<void> => {
	const userId = request.userId;
	const { id } = request.params;

	if (!userId) {
		reply.status(401).send({ error: "User not authenticated" });
		return;
	}

	try {
		const transaction = await prisma.transaction.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!transaction) {
			reply.status(404).send({ error: "ID not found" });
			return;
		}

		await prisma.transaction.delete({
			where: {
				id,
			},
		});
		reply.status(200).send({ message: "Transaction deleted successfully" });
	} catch (err) {
		request.log.error("error in delete transaction", err);
		reply.status(500).send({ error: "Internal Server Error" });
	}

};
