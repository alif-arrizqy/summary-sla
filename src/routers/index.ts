import { Application } from "express";
import slaRoutes from "./sla.routes";

export default class Routes {
	constructor(app: Application) {
		app.use("/api/sla", slaRoutes);
	}
}
