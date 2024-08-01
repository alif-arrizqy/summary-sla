import connection from "../database";
import Sla from "../models/sla.model";
import generateSlaHelper from "../helpers/generateSla.helper";
import { generateDates } from "../helpers/generateDate.helper";
import generateMonthlyReportHelper from "../helpers/generateMonthlyReport.helper";

interface BaseModelsSlaRepository {
	// interface method retrieveSummary with parameter searchParams
	// to retrieve data from database or models
	retrieveSummary(searchParams: {
		startDate: string;
		endDate: string;
	}): Promise<Sla[]>;
	retrieveReport(searchParams: {
		startDate: string;
		endDate: string;
	}): Promise<Sla[]>;
	retrieveDetail(searchParams: {
		startDate: string;
		endDate: string;
	}): Promise<Sla[]>;
	insertSlaSemeru(sla: Sla): Promise<Sla>;
	deleteSLADate(searchParams: {
		deleteDate: string;
	}): Promise<Sla[]>;
}

class SlaRepository implements BaseModelsSlaRepository {
	async retrieveSummary(searchParams: {
		startDate: string;
		endDate: string;
	}): Promise<Sla[]> {
		// query sql
		let query: string =
			"SELECT * FROM sites_sla_semeru WHERE date BETWEEN '" +
			searchParams.startDate +
			"' AND '" +
			searchParams.endDate +
			"'";

		// generate date from startDate to endDate
		const dates = generateDates(searchParams.startDate, searchParams.endDate);

		return new Promise((resolve, reject) => {
			connection.query<Sla[]>(query, (err, res) => {
				if (err) reject(err);
				else {
					let data = JSON.parse(JSON.stringify(res));
					data.map((item: any) => {
						// date format
						const dateFromDb = new Date(item.date);
						// convert to timezone local
						const dateLocal = new Date(
							dateFromDb.getTime() - dateFromDb.getTimezoneOffset() * 60000
						);
						item.date = dateLocal.toISOString().split("T")[0];
					});
					const result = generateSlaHelper.generateSummary(dates, data);
					resolve(result);
				}
			});
		});
	}

	async retrieveReport(searchParams: {
		startDate: string;
		endDate: string;
	}): Promise<Sla[]> {
		// query sql
		let query: string =
			"SELECT * FROM sites_sla_semeru WHERE date BETWEEN '" +
			searchParams.startDate +
			"' AND '" +
			searchParams.endDate +
			"'";

		// generate date from startDate to endDate
		const dates = generateDates(searchParams.startDate, searchParams.endDate);

		// generate monthly report
		const monthlyReport = await generateMonthlyReportHelper.monthlyReport(
			searchParams
		);

		return new Promise((resolve, reject) => {
			const tempResultDaily: any[] = [];

			connection.query<Sla[]>(query, (err, res) => {
				if (err) reject(err);
				else {
					let data = JSON.parse(JSON.stringify(res));
					data.map((item: any) => {
						// date format
						const dateFromDb = new Date(item.date);
						// convert to timezone local
						const dateLocal = new Date(
							dateFromDb.getTime() - dateFromDb.getTimezoneOffset() * 60000
						);
						item.date = dateLocal.toISOString().split("T")[0];
					});

					const resultDailyReport = generateSlaHelper.generateReport(
						dates,
						data
					);
					resultDailyReport.then((res) => {
						// iterate object
						Object.keys(res).forEach((key: any) => {
							tempResultDaily.push(res[key]);
						});
					});
				}
				// response data
				const sla: any = {
					report: {
						daily: tempResultDaily,
						monthly: monthlyReport,
					},
				};
				resolve(sla);
			});
		});
	}

	async retrieveDetail(searchParams: {
		startDate: string;
		endDate: string;
	}): Promise<Sla[]> {
		// query sql
		let query: string =
			"SELECT * FROM sites_sla_semeru WHERE date BETWEEN '" +
			searchParams.startDate +
			"' AND '" +
			searchParams.endDate +
			"'";

		// generate date from startDate to endDate
		const dates = generateDates(searchParams.startDate, searchParams.endDate);

		return new Promise((resolve, reject) => {
			connection.query<Sla[]>(query, (err, res) => {
				if (err) reject(err);
				else {
					let data = JSON.parse(JSON.stringify(res));
					data.map((item: any) => {
						// date format
						const dateFromDb = new Date(item.date);
						// convert to timezone local
						const dateLocal = new Date(
							dateFromDb.getTime() - dateFromDb.getTimezoneOffset() * 60000
						);
						item.date = dateLocal.toISOString().split("T")[0];
					});

					const resultDailyReport = generateSlaHelper.generateDetail(dates, data);
					resultDailyReport.then((res) => {
						resolve(res);
					});
				}
			});
		});
	}

	async retrieveSlaSite(searchParams: {
		startDate: string;
		endDate: string;
		site: string;
	}): Promise<Sla[]> {
		// query sql
		let query: string =
			"SELECT * FROM sites_sla_semeru WHERE date BETWEEN '" +
			searchParams.startDate +
			"' AND '" +
			searchParams.endDate +
			"'" +
			" AND sites = '" +
			searchParams.site +
			"'";

		// generate date from startDate to endDate
		const dates = generateDates(searchParams.startDate, searchParams.endDate);

		return new Promise((resolve, reject) => {
			connection.query<Sla[]>(query, (err, res) => {
				if (err) reject(err);
				else {
					let data = JSON.parse(JSON.stringify(res));
					data.map((item: any) => {
						// date format
						const dateFromDb = new Date(item.date);
						// convert to timezone local
						const dateLocal = new Date(
							dateFromDb.getTime() - dateFromDb.getTimezoneOffset() * 60000
						);
						item.date = dateLocal.toISOString().split("T")[0];
					});
					const result = generateSlaHelper.generateSlaSite(dates, data);
					resolve(result);
				}
			});
		});
	}

	async retrieveSlaSiteMonth(searchParams: {
		month: string;
		year: number;
		site: string;
	}): Promise<Sla[]> {
		// find end date of month
		const findEndDate = new Date(
			searchParams.year,
			parseInt(searchParams.month),
			0
		).getDate();
		const endDate = `${searchParams.year}-${searchParams.month}-${findEndDate}`;

		// generate monthly report
		const slaMonthlyReport =
			await generateMonthlyReportHelper.siteMonthlyReport(
				endDate,
				searchParams.site
			);
		return new Promise((resolve, reject) => {
			resolve(slaMonthlyReport);
		});
	}

	async insertSlaSemeru(sla: Sla): Promise<Sla> {
		return new Promise((resolve, reject) => {
			sla.map((item: any) => {
				const date = new Date(item.date);
				const dateLocal = new Date(
					date.getTime() - date.getTimezoneOffset() * 60000
				);
				item.date = dateLocal.toISOString().split("T")[0];
				connection.query(
					"INSERT INTO sites_sla_semeru (site_id, date, sites, sla, log_harian, downtime_percent, uptime_percent) VALUES (?,?,?,?,?,?,?)",
					[
						item.site_id,
						item.date,
						item.sites,
						item.sla,
						item.log_harian,
						item.downtime,
						item.uptime,
					],
					(err, res) => {
						if (err) reject(err);
						else {
							const responseObj: any = {
								message: "Sla Semeru successfully added",
							};
							resolve(responseObj);
						}
					}
				);
			});
		});
	}

	async deleteSLADate(searchParams: {
		deleteDate: string;
	}): Promise<Sla[]> {
		// query sql
		let query: string =
			"DELETE FROM sites_sla_semeru WHERE date = '" +
			searchParams.deleteDate +
			"'";
		
		return new Promise((resolve, reject) => {
			connection.query<Sla[]>(query, (err, res) => {
				if (err) reject(err);
				else {
					const responseObj:any = {
						"message": "Sla Semeru successfully deleted"
					}
					resolve(responseObj);
				}
			});
		});
	}

	getCountDowntime = (
		startDate: string,
		endDate: string,
		site: string
	): Promise<number> => {
		return new Promise((resolve, reject) => {
			const query: string = `SELECT * FROM sites_sla_semeru 
			WHERE date BETWEEN '${startDate}' AND '${endDate}' 
			AND sites = '${site}' ORDER BY date DESC`;

			connection.query<Sla[]>(query, (err, res) => {
				if (err) reject(err);
				else {
					let data = JSON.parse(JSON.stringify(res));
					data.map((item: any) => {
						delete item.id;
						delete item.date;
						delete item.site_id;
						delete item.log_harian;
						delete item.downtime_percent;
						delete item.uptime_percent;
					});

					// count total downtime sla
					const count = data.findIndex((item: any) => item.sla !== 0);
					const totalDowntime = count === -1 ? data.length : count;
					resolve(totalDowntime);
				}
			});
		});
	};
}

export default new SlaRepository();
