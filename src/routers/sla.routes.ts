import { Router } from "express";
import SlaController from "../controllers/sla.controller";

class SlaRoutes {
  router = Router();
  controller = new SlaController();

  constructor() {
    this.intializeRoutes();
  }

  intializeRoutes() {
    this.router.get("/", this.controller.findSLA);
  }
}

export default new SlaRoutes().router;