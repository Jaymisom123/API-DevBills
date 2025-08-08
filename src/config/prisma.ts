import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

export const prismaConnect = async () => {
	try {
		console.log("[DevBills][Prisma] Tentando conectar ao banco de dados");
		await prisma.$connect();
		console.log("[DevBills][Prisma] Conectado com sucesso ao banco de dados");
	} catch (err) {
		console.error("[DevBills][Prisma] Erro ao conectar ao banco de dados:", err);
		throw err; // Propaga o erro para ser tratado no nível superior
	}
};

export default prisma;
