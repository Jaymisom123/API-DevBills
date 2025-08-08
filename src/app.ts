import cors from "@fastify/cors";
import fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { env } from "./config/env.js";
import routes from "./routes/index.js";

const app: FastifyInstance = fastify({
	logger: {
		level: env.NODE_ENV === "dev" || env.NODE_ENV === "DEV" ? "info" : "error",
	},
});

// Permite múltiplas origens definidas via CORS_ORIGIN (separadas por vírgula)
const allowedOrigins = (
    env.CORS_ORIGIN && env.CORS_ORIGIN.trim().length > 0
        ? env.CORS_ORIGIN.split(",").map((o) => o.trim())
        : []
).concat(["http://localhost:5173", "https://dev-billss.netlify.app"]);

app.register(cors, {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
});

app.register(routes, { prefix: "/api" });

export default app;
