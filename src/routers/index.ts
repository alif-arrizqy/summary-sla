import { Application } from "express";
import slaRoutes from "./sla.routes";
import mitraRoutes from "./slaMitra.routes";

export default class Routes {
	constructor(app: Application) {
		app.use("/api/sla", slaRoutes);
		app.use("/api/sla/mitra", mitraRoutes);
	}
}
