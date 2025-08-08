import type { FastifyReply, FastifyRequest } from "fastify";
import admin from "firebase-admin";

// Estendendo o tipo do FastifyRequest para incluir userId
declare module "fastify" {
	interface FastifyRequest {
		userId?: string;
	}
}

/**
 * Middleware de autenticação com Firebase
 * Verifica o token JWT enviado no header Authorization
 * e adiciona o userId ao request se for válido.
 */
export const authMiddleware = async (
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<void> => {
	console.log("[DevBills][Middleware] Iniciando verificação de autenticação");
	const authHeader = request.headers.authorization;

	// Verifica se o token foi enviado no header
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		console.warn("[DevBills][Middleware] Token de autenticação não fornecido");
		reply.code(401).send({ error: "Token de autenticação não fornecido" });
		return;
	}

	const token = authHeader.replace("Bearer ", "");
	console.log("[DevBills][Middleware] Token recebido:", token.substring(0, 20) + "...");

	try {
		// Verifica a validade do token com o Firebase
		const decodedToken = await admin.auth().verifyIdToken(token);
		console.log("[DevBills][Middleware] Token decodificado:", {
			uid: decodedToken.uid,
			email: decodedToken.email,
			name: decodedToken.name
		});

		// Adiciona o userId ao request (para uso nos controllers)
		request.userId = decodedToken.uid;
  } catch (error) {
    console.error("[DevBills][Middleware] Erro ao verificar token:", error);
    request.log.error({ error }, "Erro ao verificar token:");
    reply.code(401).send({ error: "Token inválido ou expirado" });
  }
};
