import { Router } from "express";
import SlaController from "../controllers/slaMitra.controller";

class SlaRoutes {
	router = Router();
	controller = new SlaController();

	constructor() {
		this.intializeRoutes();
	}

	intializeRoutes() {
		this.router.get("/summary", this.controller.summarySLAMitra);

		this.router.get("/report", this.controller.reportSLAMitra);

		this.router.get("/detail", this.controller.detailSLAMitra);
	}
}

export default new SlaRoutes().router;
