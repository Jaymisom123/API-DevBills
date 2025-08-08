import prisma from "../config/prisma";

// Corrige documentos antigos com type em minúsculo ("expense"/"income")
export async function normalizeCategoryTypeValues(): Promise<void> {
    try {
        await prisma.$runCommandRaw({
            update: "Category",
            updates: [
                { q: { type: "expense" }, u: { $set: { type: "EXPENSE" } }, multi: true, upsert: false },
                { q: { type: "income" }, u: { $set: { type: "INCOME" } }, multi: true, upsert: false },
            ],
        } as any);
        console.log("[DevBills][Fix] Category.type normalizado (expense/income -> EXPENSE/INCOME)");
    } catch (err) {
        console.error("[DevBills][Fix] Falha ao normalizar Category.type:", err);
    }
}


