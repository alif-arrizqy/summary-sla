import { Router } from "express";
import SlaController from "../controllers/sla.controller";

class SlaRoutes {
  router = Router();
  controller = new SlaController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
		// summary sla
    this.router.get("/summary", this.controller.summarySLA);

		// report sla
		this.router.get("/report", this.controller.reportSLA);
		
		// detail sla
		this.router.get("/detail", this.controller.detailSLA);

		// sla per site
		this.router.get("/site-sla-daily", this.controller.siteSLA);

		// sla per site per month
		// this.router.get("/site-month", this.controller.siteSLAMonth);
		
  }
}

export default new SlaRoutes().router;