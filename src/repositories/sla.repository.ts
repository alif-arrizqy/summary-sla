import connection from "../database";
import Sla from "../models/sla.model";
import generateSlaHelper from "../helpers/generateSla.helper";

interface BaseModelsSlaRepository {
	// interface method retrieveDate with parameter searchParams
	// to retrieve data from database or models
  retrieveDate(searchParams: {startDate: string, endDate: string}): Promise<Sla[]>;
}

class SlaRepository implements BaseModelsSlaRepository {
	async retrieveDate(searchParams: { startDate: string, endDate: string }): Promise<Sla[]> {
		
		// query sql
		let query: string = "SELECT * FROM sites_sla_semeru WHERE date BETWEEN '" 
		+ searchParams.startDate + "' AND '" + searchParams.endDate + "'";

		// return query
		return new Promise((resolve, reject) => {
			connection.query<Sla[]>(query, (err, res) => {
				if (err) reject(err);
				// else resolve(res);
				else {
					let data = JSON.parse(JSON.stringify(res));
					data.map((item: any) => {
						// date format
						const changeDate = new Date(item.date)
						changeDate.setDate(changeDate.getDate() + 1);
						item.date = changeDate.toISOString().split('T')[0];
					});
					resolve(data);
				}
			});
		});
	}
}

export default new SlaRepository();