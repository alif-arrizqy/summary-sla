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
			// Define site categories
			const siteCategories: any = {
					talis5: { message: "Sundaya TALIS", downSla: [], underSla: [], dropSla: [], upSla: [] },
					mix: { message: "Sundaya MIX", downSla: [], underSla: [], dropSla: [], upSla: [] },
					jspro: { message: "Sundaya JSPro", downSla: [], underSla: [], dropSla: [], upSla: [] },
			};

			const downSla: any[] = [];
			const underSla: any[] = [];
			const dropSla: any[] = [];
			const upSla: any[] = [];
			const newDownSla: any[] = [];
			
			const totalSiteTalis: any[] = [];
			const totalSiteMix: any[] = [];
			const totalSiteJspro: any[] = [];

			const slaTalis: any[] = [];
			const slaMix: any[] = [];
			const slaJspro: any[] = [];
			
			const diffTalis: number[] = [];
			const diffMix: number[] = [];
			const diffJspro: number[] = [];

			let messageTalis: string = "";
			let messageMix: string = "";
			let messageJspro: string = "";

		for (let index = 0; index < dates.length; index++) {
			const newSla: Sla[] = data.filter(item => dates[index] === item.date?.toString())
					.map(item => {
							item.sla = (item.sla as number) < 1 ? parseFloat(((item.sla as number) * 100).toFixed(2)) : (item.sla as number) * 100;
							return item;
					});

			newSla.forEach(item => {
					if (item.battery_version === "talis5") slaTalis.push(item);
					else if (item.battery_version === "mix") slaMix.push(item);
					else if (item.battery_version === "jspro") slaJspro.push(item);
			});

			// Calculate average SLA
			const calculateAverageSla = (slaArray: any[], diffArray: number[]) => {
					const sum = slaArray.reduce((a, b) => a + (b.sla as number), 0);
					const avg = sum / slaArray.length;
					diffArray.push(avg);
					return avg;
			};

			const avgTalis = calculateAverageSla(slaTalis, diffTalis);
			const avgMix = calculateAverageSla(slaMix, diffMix);
			const avgJspro = calculateAverageSla(slaJspro, diffJspro);

			// Calculate difference SLA
			const calculateDifference = (diffArray: number[]) => {
					if (diffArray.length > 1) {
							return parseFloat((diffArray[diffArray.length - 1] - diffArray[diffArray.length - 2]).toFixed(2));
					}
					return 0;
			};

			const valueDiffTalis = calculateDifference(diffTalis);
			const valueDiffMix = calculateDifference(diffMix);
			const valueDiffJspro = calculateDifference(diffJspro);

			const generateMessage = (valueDiff: number, type: string) => {
					return valueDiff < 0
							? `Terdapat penurunan sebesar ${Math.abs(valueDiff)} % dari periode sebelumnya`
							: `Terdapat kenaikan sebesar ${Math.abs(valueDiff)} % dari periode sebelumnya`;
			};

			messageTalis = generateMessage(valueDiffTalis, "Talis");
			messageMix = generateMessage(valueDiffMix, "Mix");
			messageJspro = generateMessage(valueDiffJspro, "Jspro");

			// Check if SLA < 95.5 in last date
			if (index === dates.length - 1) {
				newSla.forEach(item => {
						if (item.battery_version === "talis5") totalSiteTalis.push(item.sites);
						if (item.battery_version === "mix") totalSiteMix.push(item.sites);
						if (item.battery_version === "jspro") totalSiteJspro.push(item.sites);

						if ((item.sla as number) < 95.5 && (item.sla as number) > 0) {
								underSla.push({
										date: item.date,
										sla: item.sla,
										downtime: item.downtime_percent,
										site: item.sites,
										battery_version: item.battery_version,
								});
						}
						if ((item.sla as number) === 0) {
								downSla.push({
										date: item.date,
										sla: item.sla,
										downtime: item.downtime_percent,
										site: item.sites,
										battery_version: item.battery_version,
								});
						}
				});
			}

			// Add downtime in downSla
			const results = await Promise.all(
					downSla.map(async item => {
							const weekDate = getPreviousWeeksDate(item.date);
							const countDowntime = await slaRepository.getCountDowntime(weekDate, item.date, item.site);
							item.downtime = countDowntime > 7 ? "Lebih Dari 7 Hari" : `${countDowntime} Hari`;
							return item;
					})
			);
			newDownSla.push(...results);

			// Add time information in underSla
			underSla.forEach(item => {
					const desc = generateTimeFormat(item.downtime);
					Object.assign(item, { downtime: desc });
			});

			// Add SLA Before and SLA Now in dropSla and upSla
			const separateByDate = newSla.filter(item => dates[index] === item.date?.toString());

			if (index > 0) {
				const tempBefore = data.filter(item => dates[index - 1] === item.date?.toString());

				tempBefore.forEach(item => {
					separateByDate.forEach(element => {
						if (item.sites === element.sites) {
							if ((item.sla ?? 0) > 95.5 && (element.sla ?? 0) > 95.5) return;
							if ((item.sla ?? 0) > (element.sla ?? 0)) {
									dropSla.push({
											date: element.date,
											site: item.sites,
											slaBefore: item.sla,
											slaNow: element.sla,
									});
							} else if ((item.sla ?? 0) < (element.sla ?? 0)) {
									upSla.push({
											date: element.date,
											site: item.sites,
											slaBefore: (item.sla ?? 0),
											slaNow: element.sla,
									});
							}
						}
					});
				});
			}
		}

		const totalTalis = new Set(totalSiteTalis).size;
		const totalMix = new Set(totalSiteMix).size;
		const totalJspro = new Set(totalSiteJspro).size;

		siteCategories.talis5.message = `Sundaya TALIS (${totalTalis} Site) pada tanggal ${dates[1]} ${messageTalis}`;
		siteCategories.mix.message = `Sundaya MIX (${totalMix} Site) pada tanggal ${dates[1]} ${messageMix}`;
		siteCategories.jspro.message = `Sundaya JSPro (${totalJspro} Site) pada tanggal ${dates[1]} ${messageJspro}`;

		const filterByBatteryVersion = (array: any[], version: string) => array.filter(item => item.battery_version === version);

		siteCategories.talis5.downSla = filterByBatteryVersion(newDownSla, "talis5");
		siteCategories.talis5.underSla = filterByBatteryVersion(underSla, "talis5");
		siteCategories.talis5.dropSla = filterByBatteryVersion(dropSla, "talis5");
		siteCategories.talis5.upSla = filterByBatteryVersion(upSla, "talis5");

		siteCategories.mix.downSla = filterByBatteryVersion(newDownSla, "mix");
		siteCategories.mix.underSla = filterByBatteryVersion(underSla, "mix");
		siteCategories.mix.dropSla = filterByBatteryVersion(dropSla, "mix");
		siteCategories.mix.upSla = filterByBatteryVersion(upSla, "mix");

		siteCategories.jspro.downSla = filterByBatteryVersion(newDownSla, "jspro");
		siteCategories.jspro.underSla = filterByBatteryVersion(underSla, "jspro");
		siteCategories.jspro.dropSla = filterByBatteryVersion(dropSla, "jspro");
		siteCategories.jspro.upSla = filterByBatteryVersion(upSla, "jspro");

		resolve(siteCategories);
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
