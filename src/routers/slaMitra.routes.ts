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
	}
}

export default new SlaRoutes().router;
