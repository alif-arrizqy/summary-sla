import { sep } from "path";
import Sla from "../models/sla.model";

class GenerateSLA {
	generateSummary = (dates: string[], data: Sla[]): Promise<Sla[]> => {
		return new Promise((resolve, reject) => {
			// create index and value of dates
			const summary: any[] = [];

			dates.forEach((date, index) => {
				const avgSla: Sla[] = [];
				data.forEach((item) => {
					if (dates[index] === item.date?.toString()) {
						if ((item.sla as number) < 1) {
							const sla: number = parseFloat(((item.sla as number) * 100).toFixed(2));
							item.sla = sla;
						} else {
							const sla: number = (item.sla as number) * 100;
							item.sla = sla;
						}
						avgSla.push(item);
					}
				});

				// calculate average
				const sumSla = avgSla.reduce((a, b) => a + (b.sla as number), 0);
				const avg = sumSla / avgSla.length;

				// push to data
				const sla: any = {
					date: dates[index],
					value: parseFloat(avg.toFixed(2)),
				};
				summary.push(sla);
			});
			resolve(summary);
		});
	};

	generateReport = (dates: string[], data: Sla[]): Promise<Sla[]> => {
		return new Promise((resolve, reject) => {
			// create index and value of dates
			const diff: number[] = [];
			const tempReportDaily: Sla[] = [];

			dates.forEach((date, index) => {
				const avgSla: Sla[] = [];
				data.forEach((item) => {
					if (dates[index] === item.date?.toString()) {
						if ((item.sla as number) < 1) {
							const sla: number = parseFloat(((item.sla as number) * 100).toFixed(2));
							item.sla = sla;
						} else {
							const sla: number = (item.sla as number) * 100;
							item.sla = sla;
						}
						avgSla.push(item);
					}
				});

				// calculate average
				const sumSla = avgSla.reduce((a, b) => a + (b.sla as number), 0);
				const avg = sumSla / avgSla.length;
				diff.push(avg);

				// calculate differece
				let valueDiff: number = 0;
				if (diff.length > 1) {
					valueDiff = parseFloat(
						(diff[diff.length - 1] - diff[diff.length - 2]).toFixed(2)
					);
				}

				// message if valueDiff < 0 then SLA down, else SLA up
				let message: string = "";
				if (valueDiff < 0) {
					message = `Terdapat penurunan sebesar ${Math.abs(valueDiff)} % dari periode sebelumnya`;
				} else {
					message = `Terdapat kenaikan sebesar ${Math.abs(valueDiff)} % dari periode sebelumnya`;
				};

				// push to data
				const sla: any = {
					date: dates[index],
					value: parseFloat(avg.toFixed(2)),
					message: message,
				};
				tempReportDaily.push(sla);
			});
			resolve(tempReportDaily);

			// const report:any = {
			// 	"reportDailly": tempReportDaily,
			// }
			// resolve(report);
		});
	};
}
export default new GenerateSLA();
