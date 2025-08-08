import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../config/prisma";
import { env } from "../config/env";

export const getCategories = async (
    request: FastifyRequest,
    reply: FastifyReply,
): Promise<void> => {
    try {
        console.log("[DevBills][Backend] Iniciando busca de categorias");

        const userId = (request as any).userId as string | undefined;
        if (!userId) {
            reply.code(401).send({ error: "Usuário não autenticado" });
            return;
        }

        console.log("[DevBills][Backend] userId:", userId);

        let categories: Array<{ id?: string; _id?: string; name: string; color: string; type: string }> = [];
        try {
            // Caminho normal via Prisma
            categories = await prisma.category.findMany({
                orderBy: { name: "asc" },
                select: { id: true, name: true, color: true, type: true },
            }) as any;
        } catch (err) {
            // Fallback seguro: lê direto do Mongo quando há valores inválidos no enum
            console.warn("[DevBills][Backend] Prisma enum read failed; using raw Mongo fallback");
            const raw: any = await prisma.$runCommandRaw({
                aggregate: "Category",
                pipeline: [
                    { $project: { _id: 1, name: 1, color: 1, type: 1 } },
                    { $sort: { name: 1 } },
                ],
                cursor: {},
            } as any);
            categories = (raw?.cursor?.firstBatch ?? []) as any[];
        }

        const normalizeId = (value: any): string => {
            if (typeof value === "string") return value;
            if (value && typeof value === "object") {
                if (typeof (value as any).$oid === "string") return (value as any).$oid;
                const asString = value.toString?.();
                if (typeof asString === "string") {
                    const m = asString.match(/[a-fA-F0-9]{24}/);
                    if (m) return m[0];
                    return asString;
                }
            }
            return String(value ?? "");
        };

        const normalized = categories.map((c) => {
            const t = String(c.type ?? "EXPENSE").toUpperCase();
            const normalizedType = t === "INCOME" ? "INCOME" : "EXPENSE";
            return {
                id: (c as any).id ?? normalizeId((c as any)._id),
                name: c.name,
                color: c.color,
                type: normalizedType,
            };
        });

        
        const uniqueByNameType = new Map<string, typeof normalized[number]>();
        for (const item of normalized) {
            const key = `${item.name}|${item.type}`;
            if (!uniqueByNameType.has(key)) {
                uniqueByNameType.set(key, item);
            }
        }

        const result = Array.from(uniqueByNameType.values()).sort((a, b) =>
            a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" }),
        );

        reply.send(result);
    } catch (error: any) {
        console.error("[DevBills][Backend] Erro ao buscar categorias:", error);
        request.log.error("error in getCategories", error?.message ?? error);
        const body = env.NODE_ENV?.toString().toLowerCase().startsWith("dev")
            ? { error: "Internal Server Error", message: String(error?.message ?? error) }
            : { error: "Internal Server Error" };
        reply.status(500).send(body);
    }
};
