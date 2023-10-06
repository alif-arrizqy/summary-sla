import { Request, Response } from "express";
// import Sla from "../models/sla.model";
import slaRepository from "../repositories/sla.repository";
import DateValidation from "../helpers/validation.helper";

export default class SlaController {
	async summarySLA(req: Request, res: Response) {

		// Validate request
		const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
		const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";
		
		// validate date
		const validate = await DateValidation.validateDate(startDate, endDate);
		if (validate?.code === 400) {
			res.status(400).send(validate);
		} else {
			try {
				// await summary sla
				const sla = await slaRepository.retrieveSummary({ startDate: startDate, endDate: endDate });
				if (sla)
					res.status(200).send({
						code: 200,
						success: true,
						data: sla,
					});
				else
					res.status(404).send({
						code: 404,
						success: false,
						message: `Cannot find Sla with date=${startDate} and date=${endDate}.`,
					});
			} catch (err) {
				res.status(500).send({
					code: 500,
					success: false,
					message: `Error retrieving Sla with date=${startDate} and date=${endDate}.`,
				});
			}
		}
	}

	async reportSLA(req: Request, res: Response) {

		// Validate request
		const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
		const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";
		
		// validate date
		const validate = await DateValidation.validateDate(startDate, endDate);
		if (validate?.code === 400) {
			res.status(400).send(validate);
		} else {
			try {
				// await report sla
				const sla = await slaRepository.retrieveReport({ startDate: startDate, endDate: endDate });
				if (sla)
					res.status(200).send({
						code: 200,
						success: true,
						data: sla,
					});
				else
					res.status(404).send({
						code: 404,
						success: false,
						message: `Cannot find Sla with date=${startDate} and date=${endDate}.`,
					});
			} catch (err) {
				res.status(500).send({
					code: 500,
					success: false,
					message: `Error retrieving Sla with date=${startDate} and date=${endDate}.`,
				});
			}
		}
	}

}
