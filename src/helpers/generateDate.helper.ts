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

const getPreviousWeeksDate = (date: string): string => {
	const dateObj = new Date(date);
	dateObj.setDate(dateObj.getDate() - 7);
	return dateObj.toISOString().split("T")[0];
}

const changeFormat = (date: string): string => {
	// from year-month-date to date/month/year
	const dateArr = date.split("-");
	return `${dateArr[2]}/${dateArr[1]}/${dateArr[0]}`;
}

export { generateDates, generateTimeFormat, getPreviousWeeksDate, changeFormat };
