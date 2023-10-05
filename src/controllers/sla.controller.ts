import { Request, Response } from "express";
// import Sla from "../models/sla.model";
import slaRepository from "../repositories/sla.repository";

export default class SlaController {
	async findOne(req: Request, res: Response) {

		// Validate request
		const date = typeof req.query.date === "string" ? req.query.date : "";
		
		try {
			// await slaRepository retrieveDate
			const sla = await slaRepository.retrieveDate({ date: date });

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
					message: `Cannot find Sla with date=${date}.`,
				});
		} catch (err) {
			res.status(500).send({
				code: 500,
				success: false,
				message: `Error retrieving Sla with date=${date}.`,
			});
		}
	}
}
