import app from "./app";
import { env } from "./config/env";
import initializeFirebaseAdmin from "./config/firebase";
import { prismaConnect } from "./config/prisma";
import { initializeGlobalCategories } from "./services/globalCategories.service";
import { normalizeCategoryTypeValues } from "./services/fixCategoriesType.service";

const PORT = process.env.PORT || env.PORT || 3000;

initializeFirebaseAdmin();

const startServer = async () => {
	try {
		await prismaConnect();

		// Corrige possíveis registros antigos com type em minúsculo
		await normalizeCategoryTypeValues();

		await initializeGlobalCategories();

		await app.listen({ port: Number(PORT), host: "0.0.0.0" });

		console.log(`🚀 Server is running on port ${PORT}`);
	} catch (error) {
		console.error("Error starting the server:", error);
	}
};

startServer();
