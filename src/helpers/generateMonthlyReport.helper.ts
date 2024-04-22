import connection from "../database";
import Sla from "../models/sla.model";
import generateDates from "../helpers/generateDate.helper";
import generateSlaHelper from "./generateSla.helper";

interface BaseMonthlyReportRepository {
	monthlyReport(searchParams: { endDate: string }): Promise<Sla[]>;
}

class SlaMonthlyReport implements BaseMonthlyReportRepository {
	async monthlyReport(searchParams: { endDate: string }): Promise<Sla[]> {
		// get month and year from endDate
		const endDate = new Date(searchParams.endDate);
		const month = (endDate.getMonth() + 1).toString().padStart(2, "0");
		const year = endDate.getFullYear();
		// create start date
		const startDate: string = `${year}-${month}-01`;

		// generate date from startDate to endDate
		const dates = generateDates(startDate, searchParams.endDate);

		// query sql
		let query: string = `SELECT * FROM sites_sla_semeru WHERE date BETWEEN '${startDate}' AND '${searchParams.endDate}'`;

		return new Promise((resolve, reject) => {
			const tempResultDaily: any[] = [];
			const avgSla: number[] = [];

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

					const resultMonth = generateSlaHelper.generateReport(dates, data);
					resultMonth.then((res) => {
						Object.keys(res).forEach((key: any) => {
							tempResultDaily.push(res[key]);
						});
						// get value
						tempResultDaily.forEach((item) => {
							avgSla.push(item.value);
						});
						// average
						const sum = avgSla.reduce((a, b) => a + b, 0);
						const avg = (sum / avgSla.length).toFixed(2);
						const sla: any = {
							date: searchParams.endDate,
							value: parseFloat(avg),
						};
						resolve(sla);
					});
				}
			});
		});
	}

	async siteMonthlyReport(endDate: string, site: string): Promise<Sla[]> {
		// get month and year from endDate
		const endOfDate = new Date(endDate);
		const month = endOfDate.getMonth() + 1;
		const year = endOfDate.getFullYear();
		// create start date
		const startDate: string = `${year}-${month}-01`;

		// generate date from startDate to endDate
		const dates = generateDates(startDate, endOfDate.toISOString().split("T")[0]);

		// query sql
		let query: string = `SELECT * FROM sites_sla_semeru WHERE date BETWEEN '${startDate}' AND '${endOfDate.toISOString().split("T")[0]}' AND sites = '${site}'`;

		return new Promise((resolve, reject) => {
			const tempResultDaily: any[] = [];
			const avgSla: number[] = [];

			connection.query<Sla[]>(query, (err, res) => {
				if (err || res.length === 0) reject(err);
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

					const resultMonth = generateSlaHelper.generateReport(dates, data);
					resultMonth.then((res) => {
						Object.keys(res).forEach((key: any) => {
							tempResultDaily.push(res[key]);
						});
						// get value
						tempResultDaily.forEach((item) => {
							if (!isNaN(item.value)) avgSla.push(item.value);
						});
						// average
						const sum = avgSla.reduce((a, b) => a + b, 0);
						const avg = (sum / avgSla.length).toFixed(2);
						const sla: any = {
							site: site,
							month: month,
							year: year,
							value: parseFloat(avg),
						};
						resolve(sla);
					});
				}
			});
		});
	}
}

export default new SlaMonthlyReport();
