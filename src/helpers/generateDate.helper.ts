const generateDates = (startDate: string, endDate: string): string[] => {
	const dateStart = new Date(startDate);
	const dateEnd = new Date(endDate);
	const dates: string[] = [];

	while (dateStart <= dateEnd) {
		dates.push(dateStart.toISOString().split("T")[0]);
		dateStart.setDate(dateStart.getDate() + 1);
	}
	return dates;
};

const generateTimeFormat = (downtime: number): string => {
	const downtimeHours = (downtime / 100) * 24;

	const hours = Math.floor(downtimeHours);
	const minutes = Math.round((downtimeHours - hours) * 60);
	return `${hours} jam ${minutes} menit`;
};

export { generateDates, generateTimeFormat };
