import connection from "../database";
import Sla from "../models/sla.model";
import generateSlaHelper from "../helpers/generateSla.helper";
import generateDates from "../helpers/generateDate.helper";
import generateMonthlyReportHelper from "../helpers/generateMonthlyReport.helper";

interface BaseModelsSlaMitrasRepository {
	retrieveSummaryMitra(searchParams: {
		startDate: string;
		endDate: string;
		mitra: string;
	}): Promise<Sla[]>;
}

class SlaMitraRepository implements BaseModelsSlaMitrasRepository {
	async retrieveSummaryMitra(searchParams: {
		startDate: string;
		endDate: string;
		mitra: string;
	}): Promise<Sla[]> {
		
		let provinsi: string = "";
		if (searchParams.mitra === "ecom") {
			provinsi = "MALUKU"
		} else if (searchParams.mitra === "lindu") {
			provinsi = "PAPUA"
		}
		
		// query sql
		let query: string =
			`SELECT sla_semeru.date, sla_semeru.sites, sla_semeru.sla, detail_site.provinsi`
			+ ` FROM sites_sla_semeru as sla_semeru INNER JOIN detail_site`
			+ ` ON sla_semeru.sites = detail_site.site_name`
			+ ` WHERE provinsi LIKE '${provinsi}%' AND date BETWEEN '${searchParams.startDate}' AND '${searchParams.endDate}'`;

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

	async retrieveReportMitra(searchParams: {
		startDate: string;
		endDate: string;
		mitra: string;
	}): Promise<Sla[]> {
		
		let provinsi: string = "";
		if (searchParams.mitra === "ecom") {
			provinsi = "MALUKU"
		} else if (searchParams.mitra === "lindu") {
			provinsi = "PAPUA"
		}
		
		// query sql
		let query: string =
			`SELECT sla_semeru.date, sla_semeru.sites, sla_semeru.sla, detail_site.provinsi`
			+ ` FROM sites_sla_semeru as sla_semeru INNER JOIN detail_site`
			+ ` ON sla_semeru.sites = detail_site.site_name`
			+ ` WHERE provinsi LIKE '${provinsi}%' AND date BETWEEN '${searchParams.startDate}' AND '${searchParams.endDate}'`;

		// generate date from startDate to endDate
		const dates = generateDates(searchParams.startDate, searchParams.endDate);

		// generate monthly report
		const monthlyReport = await generateMonthlyReportHelper.mitraMonthlyReport(searchParams.endDate, provinsi)

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

					const resultDailyReport = generateSlaHelper.generateReport(dates, data);
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
}

export default new SlaMitraRepository();