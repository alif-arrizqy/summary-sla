import connection from "../database";
import Sla from "../models/sla.model";
import generateSlaHelper from "../helpers/generateSla.helper";
import generateDates from "../helpers/generateDate.helper";
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
						const changeDate = new Date(item.date);
						changeDate.setDate(changeDate.getDate() + 1);
						item.date = changeDate.toISOString().split("T")[0];
					});
					const result = generateSlaHelper.generateSummary(dates, data);
					console.log(result);
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
		const monthlyReport = await generateMonthlyReportHelper.monthlyReport(searchParams);
		// console.log(monthlyReport);

		return new Promise((resolve, reject) => {
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
					const result = generateSlaHelper.generateReport(dates, data);
					// resolve(result);
					// add monthly report to result
					const report: any = {
						monthlyReport: monthlyReport,
						dailyReport: result,
					};
					resolve(report);
				}
			});
		});
	}
}

export default new SlaRepository();
