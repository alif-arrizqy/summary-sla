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
						const changeDate = new Date(item.date);
						changeDate.setDate(changeDate.getDate() + 1);
						item.date = changeDate.toISOString().split("T")[0];
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
}

export default new SlaMonthlyReport();