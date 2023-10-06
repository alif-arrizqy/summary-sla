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
		const month = endDate.getMonth() + 1;
		const year = endDate.getFullYear();
		// create start date
		const startDate:string = `${year}-${month}-01`;
		
		// generate date from startDate to endDate
		const dates = generateDates(startDate, searchParams.endDate);
		
		// query sql
		let query: string = `SELECT * FROM sites_sla_semeru WHERE date BETWEEN '${startDate}' AND '${searchParams.endDate}'`;
		
		return new Promise((resolve, reject) => {
			connection.query<Sla[]>(query, (err, res) => {
				if (err) reject(err);
				else {
					const avgSla: Sla[] = [];
					const tempReportMonthly: string[] = [];

					let data = JSON.parse(JSON.stringify(res));
					data.map((item: any) => {
						// date format
						const changeDate = new Date(item.date);
						changeDate.setDate(changeDate.getDate() + 1);
						item.date = changeDate.toISOString().split("T")[0];
					});
					const resultMonth = generateSlaHelper.generateReport(dates, data);
					const result: any[] = [];
					resultMonth.then((res) => {
						if (Array.isArray(res)) reject(res);
						else {
							// convert object to array
							Object.keys(res).forEach((key) => {
								result.push(res[key]);
							});
						}
						// average sla
						result.forEach((item) => {
							item.forEach((data:any) => {
								avgSla.push(data);
							})
						});
						// average
						const sumSla = avgSla.reduce((a, b) => a + (b.value as number), 0);
						const avg = sumSla / avgSla.length;
						const sla: any = {
							date: searchParams.endDate,
							value: parseFloat(avg.toFixed(2)),
						};
						tempReportMonthly.push(sla);
						resolve(tempReportMonthly);
					});
				}
			});
		});
	}
}

export default new SlaMonthlyReport();
