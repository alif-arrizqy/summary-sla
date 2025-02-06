import connection from "../database";
import Sla from "../models/sla.model";
import { generateDates } from "../helpers/generateDate.helper";
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
		// let query: string = `SELECT * FROM sites_sla_semeru WHERE date BETWEEN '${startDate}' AND '${searchParams.endDate}'`;
		let query: string = `SELECT site.site_name, sla.date, sla.sites, sla.sla, sla.downtime_percent, site.battery_version
			FROM detail_site AS site
			INNER JOIN sites_sla_semeru AS sla
			ON site.site_id = sla.site_id
			WHERE sla.date BETWEEN '${startDate}' AND '${searchParams.endDate}'
			AND site.battery_version IN ('talis5', 'mix', 'jspro')
			AND site.is_active = 1
			ORDER BY sla.date ASC, site.battery_version DESC`;

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

	async monthyReportByBattery(searchParams: {
		endDate: string;
		battery: string;
	}): Promise<Sla[]> {
		// get month and year from endDate
		const endDate = new Date(searchParams.endDate);
		const month = (endDate.getMonth() + 1).toString().padStart(2, "0");
		const year = endDate.getFullYear();
		// create start date
		const startDate: string = `${year}-${month}-01`;

		// query sql
		let query: string = `SELECT site.site_name, sla.date, sla.sites, sla.sla, sla.downtime_percent, site.battery_version
			FROM detail_site AS site
			INNER JOIN sites_sla_semeru AS sla
			ON site.site_id = sla.site_id
			WHERE sla.date BETWEEN '${startDate}' AND '${searchParams.endDate}'
			AND site.battery_version = '${searchParams.battery}'
			AND site.is_active = 1
			ORDER BY sla.date ASC, site.battery_version DESC`;

		return new Promise((resolve, reject) => {
			connection.query<Sla[]>(query, (err, res) => {
				if (err) reject(err);
				else {
					let data = JSON.parse(JSON.stringify(res));
					let dailyAverages: number[] = [];

					data.map((item: any) => {
						// date format
						const dateFromDb = new Date(item.date);
						// convert to timezone local
						const dateLocal = new Date(
							dateFromDb.getTime() - dateFromDb.getTimezoneOffset() * 60000
						);
						item.date = dateLocal.toISOString().split("T")[0];
						if ((item.sla as number) < 1) {
							const sla: number = parseFloat(
								((item.sla as number) * 100).toFixed(2)
							);
							item.sla = sla;
						} else {
							const sla: number = (item.sla as number) * 100;
							item.sla = sla;
						}
					});

					// Group data by date
					const groupedData = data.reduce((acc: any, item: any) => {
						if (!acc[item.date]) {
							acc[item.date] = [];
						}
						acc[item.date].push(item);
						return acc;
					}, {});

					// Calculate daily averages and push to dailyAverages array
					for (const date in groupedData) {
						const dailyData = groupedData[date];
						const sumSla = dailyData.reduce((a: any, b: any) => a + b.sla, 0);
						const avgSla = sumSla / dailyData.length;
						dailyAverages.push(avgSla);
					}

					// Calculate final average
					const finalSumSla = dailyAverages.reduce((a, b) => a + b, 0);
					const finalAvgSla = (finalSumSla / dailyAverages.length).toFixed(2);

					const sla: any = {
						date: searchParams.endDate,
						value: parseFloat(finalAvgSla),
					};
					resolve(sla);
				}
			});
		});
	}

	async siteMonthlyReport(endDate: string, site: string): Promise<Sla[]> {
		// get month and year from endDate
		const endOfDate = new Date(endDate);
		const month = (endOfDate.getMonth() + 1).toString().padStart(2, "0");
		const year = endOfDate.getFullYear();
		// create start date
		const startDate: string = `${year}-${month}-01`;

		// generate date from startDate to endDate
		const dates = generateDates(startDate, endDate);

		// query sql
		let query: string = `SELECT * FROM sites_sla_semeru WHERE date BETWEEN '${startDate}' AND '${endDate}' AND sites = '${site}'`;

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

	async mitraMonthlyReport(endDate: string, provinsi: string): Promise<Sla[]> {
		// get month and year from endDate
		const endOfDate = new Date(endDate);
		const month = (endOfDate.getMonth() + 1).toString().padStart(2, "0");
		const year = endOfDate.getFullYear();

		// create start date
		const startDate: string = `${year}-${month}-01`;

		// generate date from startDate to endDate
		const dates = generateDates(startDate, endDate);

		// query sql
		let query: string =
			`SELECT sla_semeru.date, sla_semeru.sites, sla_semeru.sla, detail_site.provinsi` +
			` FROM sites_sla_semeru as sla_semeru INNER JOIN detail_site` +
			` ON sla_semeru.sites = detail_site.site_name` +
			` WHERE provinsi LIKE '${provinsi}%' AND date BETWEEN '${startDate}' AND '${endDate}'`;

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
							date: endDate,
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
