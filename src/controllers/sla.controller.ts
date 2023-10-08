import { Request, Response } from "express";
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

	async detailSLA(req: Request, res: Response) {

		// Validate request
		const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
		const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";

		// if range endDate - startDate > 2 day then return error
		const rangeDate = DateValidation.rangeDate(startDate, endDate);
		rangeDate.then((result) => {
			if (result?.code === 400) {
				res.status(400).send(result);
			}
		})
		
		// validate date
		const validate = await DateValidation.validateDate(startDate, endDate);
		if (validate?.code === 400) {
			res.status(400).send(validate);
		} else {
			try {
				// await report sla
				const sla = await slaRepository.retrieveDetail({ startDate: startDate, endDate: endDate });
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

	async siteSLA(req: Request, res: Response) {

		// Validate request
		const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
		const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";
		const site = typeof req.query.site === "string" ? req.query.site : "";

		// upper case site
		const siteUpperCase = site.toUpperCase();
		
		// validate date
		const validate = await DateValidation.validateDate(startDate, endDate);
		if (validate?.code === 400) {
			res.status(400).send(validate);
		} else {
			try {
				// await report sla
				const sla = await slaRepository.retrieveSlaSite({ startDate: startDate, endDate: endDate, site: siteUpperCase });
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
