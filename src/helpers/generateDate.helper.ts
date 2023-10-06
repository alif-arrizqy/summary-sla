const generateDates = (startDate: string, endDate: string): string[] => {
	const dateStart = new Date(startDate);
	const dateEnd = new Date(endDate);
	const dates: string[] = [];

	while (dateStart <= dateEnd) {
		dates.push(dateStart.toISOString().split("T")[0]);
		dateStart.setDate(dateStart.getDate() + 1);
	}
	return dates;
}
export default generateDates;