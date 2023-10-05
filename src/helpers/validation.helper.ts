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
}

export default new DateValidation();