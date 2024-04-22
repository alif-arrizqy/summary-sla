import { Request, Response } from "express";
import slaMitraRepository from "../repositories/slaMitra.repository";
import DateValidation from "../helpers/validation.helper";

export default class SlaMitraController {

	async summarySLAMitra(req: Request, res: Response) {

		// Validate request
		const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
		const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";
		const mitra = typeof req.query.mitra === "string" ? req.query.mitra : "";

		// validate date
		const validate = await DateValidation.validateDate(startDate, endDate);
		if (validate?. code === 400) {
			res.status(400).send(validate);
		} else {
			try {
				const sla = await slaMitraRepository.retrieveSummaryMitra({ startDate: startDate, endDate: endDate, mitra: mitra });
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

	async reportSLAMitra(req: Request, res: Response) {
		
		// Validate request
		const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
		const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";
		const mitra = typeof req.query.mitra === "string" ? req.query.mitra : "";

		// validate date
		const validate = await DateValidation.validateDate(startDate, endDate);
		if (validate?. code === 400) {
			res.status(400).send(validate);
		} else {
			try {
				const sla = await slaMitraRepository.retrieveReportMitra({ startDate: startDate, endDate: endDate, mitra: mitra });
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
