import app from "./app.js";
import { env } from "./config/env.js";
import initializeFirebaseAdmin from "./config/firebase.js";
import prisma, { prismaConnect } from "./config/prisma.js";
import { initializeGlobalCategories } from "./services/globalCategories.service.js";
import { normalizeCategoryTypeValues } from "./services/fixCategoriesType.service.js";

const PORT = Number(process.env.PORT || env.PORT || 3000);
const HOST = "0.0.0.0";

let isShuttingDown = false;

function printStartupBanner() {
    const now = new Date().toLocaleString();
    // eslint-disable-next-line no-console
    console.log(
        [
            "\n========================================",
            ` DevBills API` ,
            "----------------------------------------",
            ` Env: ${env.NODE_ENV}`,
            ` Port: ${PORT}`,
            ` Host: ${HOST}`,
            ` CORS: ${process.env.CORS_ORIGIN ?? env.CORS_ORIGIN ?? "http://localhost:5173"}`,
            ` Started at: ${now}`,
            "========================================\n",
        ].join("\n"),
    );
}

async function shutdown(signal: string) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    // eslint-disable-next-line no-console
    console.log(`\n[DevBills] Received ${signal}. Shutting down gracefully...`);
    try {
        await app.close();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[DevBills] Error while closing Fastify app:", err);
    }
    try {
        await prisma.$disconnect();
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[DevBills] Error while disconnecting Prisma:", err);
    }
    process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
    // eslint-disable-next-line no-console
    console.error("[DevBills] Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
    // eslint-disable-next-line no-console
    console.error("[DevBills] Uncaught Exception:", err);
});

async function startServer() {
    try {
        initializeFirebaseAdmin();

        await prismaConnect();

        // Corrige possíveis registros antigos com type em minúsculo
        await normalizeCategoryTypeValues();

        await initializeGlobalCategories();

        await app.listen({ port: PORT, host: HOST });

        printStartupBanner();
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("[DevBills] Error starting the server:", error);
        process.exit(1);
    }
}

void startServer();
