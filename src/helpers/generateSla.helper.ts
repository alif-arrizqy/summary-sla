import Sla from "../models/sla.model";
import {
	generateTimeFormat,
	getPreviousWeeksDate,
} from "./generateDate.helper";
import slaRepository from "../repositories/sla.repository";

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

				// Calculate total site
				const totalSite = new Set(avgSla.map((item) => item.sites)).size;

				// message if valueDiff < 0 then SLA down, else SLA up
				let message: string = "";
				if (valueDiff < 0) {
					message = `Dear team, berikut SLA Sundaya (${totalSite} Site) pada tanggal ${dates[index]}\nTerdapat penurunan sebesar ${Math.abs(valueDiff)} % dari periode sebelumnya`;
				} else {
					message = `Dear team, berikut SLA Sundaya (${totalSite} Site) pada tanggal ${dates[index]}\nTerdapat kenaikan sebesar ${Math.abs(valueDiff)} % dari periode sebelumnya`;
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
		});
	};

	generateDetail = (dates: string[], data: Sla[]): Promise<Sla[]> => {
		return new Promise(async (resolve, reject) => {
			const downSla: any[] = [];
			const underSla: any[] = [];
			const dropSla: any[] = [];
			const upSla: any[] = [];
			const newDownSla: any[] = [];

			for (let index = 0; index < dates.length; index++) {
				const newSla: Sla[] = [];

				data.forEach((item) => {
					if (dates[index] === item.date?.toString()) {
						const sla: number =
							(item.sla as number) < 1
								? parseFloat(((item.sla as number) * 100).toFixed(2))
								: (item.sla as number) * 100;
						item.sla = sla;
						newSla.push(item);
					}
				});

				// check if sla < 95.5 in last of dates
				if (index === dates.length - 1) {
					newSla.forEach((item) => {
						if ((item.sla as number) < 95.5 && (item.sla as number) > 0) {
							underSla.push({
								date: item.date,
								sla: item.sla,
								downtime: item.downtime_percent,
								site: item.sites,
							});
						}
						if ((item.sla as number) === 0) {
							downSla.push({
								date: item.date,
								sla: item.sla,
								downtime: item.downtime_percent,
								site: item.sites,
							});
						}
					});
				}

				const results = await Promise.all(
					downSla.map(async (item) => {
						const weekDate = getPreviousWeeksDate(item.date);
						const countDowntime = await slaRepository.getCountDowntime(
							weekDate,
							item.date,
							item.site
						);
						item.downtime = countDowntime > 7 ? "Lebih Dari 7 Hari" : `${countDowntime} Hari`;
						return item;
					})
				);
				newDownSla.push(...results);

				// add times description in underSla using format time
				underSla.forEach((item) => {
					const desc = generateTimeFormat(item.downtime);
					Object.assign(item, { downtime: desc });
				});

				const separateByDate: any[] = [];
				newSla.forEach((item) => {
					if (dates[index] === item.date?.toString()) {
						separateByDate.push(item);
					}
				});

				if (index > 0) {
					const tempBefore: any[] = [];
					data.forEach((item) => {
						if (dates[index - 1] === item.date?.toString()) {
							tempBefore.push(item);
						}
					});

					tempBefore.forEach((item) => {
						separateByDate.forEach((element) => {
							if (item.sites === element.sites) {
								if (item.sla > 95.5 && element.sla > 95.5) {
									// skip
								} else if (item.sla > element.sla) {
									dropSla.push({
										date: element.date,
										site: item.sites,
										slaBefore: item.sla,
										slaNow: element.sla,
									});
								} else if (item.sla < element.sla) {
									upSla.push({
										date: element.date,
										site: item.sites,
										slaBefore: item.sla,
										slaNow: element.sla,
									});
								}
							}
						});
					});
				}
			}

			const sla: any = {
				downSla: newDownSla,
				underSla: underSla,
				dropSla: dropSla,
				upSla: upSla,
			};
			resolve(sla);
		});
	};

	generateSlaSite = (dates: string[], data: Sla[]): Promise<Sla[]> => {
		return new Promise((resolve, reject) => {
			// create index and value of dates
			const summary: any[] = [];

			dates.forEach((date, index) => {
				const avgSla: Sla[] = [];
				data.forEach((item) => {
					if (dates[index] === item.date?.toString()) {
						if ((item.sla as number) < 1) {
							const sla: number = parseFloat(
								((item.sla as number) * 100).toFixed(2)
							);
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
}
export default new GenerateSLA();
