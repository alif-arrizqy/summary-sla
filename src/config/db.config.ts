import dotenv from "dotenv";

const env = dotenv.config();

if (env.parsed?.NODE_ENV === "development") {
	dotenv.config({ path: ".env.development" });
} else if (env.parsed?.NODE_ENV === "production") {
	dotenv.config({ path: ".env.production" });
}

export default {
	HOST: process.env.DB_HOST,
	USERNAME: process.env.DB_USERNAME,
	PASSWORD: process.env.DB_PASSWORD,
	DB: process.env.DB_NAME,
};
