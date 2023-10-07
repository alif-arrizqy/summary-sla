class DateValidation {
	async validateDate(startDate: string, endDate:string) {
		
		// validate date
		if (!startDate || !endDate) {
			return {
				code: 400,
				success: false,
				message: "Content can not be empty!",
			};
		}
		// if startDate > endDate
		else if (startDate > endDate) {
			return {
				code: 400,
				success: false,
				message: "startDate can not be greater than endDate!",
			};
		}
	}

	async rangeDate(startDate: string, endDate:string) {
		const start = new Date(startDate);
		const end = new Date(endDate);
		const range = Math.abs(end.getTime() - start.getTime());
		const days = Math.ceil(range / (1000 * 3600 * 24));
		if (days > 1) {
			return {
				code: 400,
				success: false,
				message: "range date can not be greater than 1 days!",
			};
		}
	}
}

export default new DateValidation();