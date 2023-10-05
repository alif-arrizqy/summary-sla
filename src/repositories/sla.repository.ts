import connection from "../database";
import Sla from "../models/sla.model";

interface BaseModelsSlaRepository {
	// interface method retrieveDate with parameter searchParams
	// to retrieve data from database or models
  retrieveDate(searchParams: {date: string}): Promise<Sla[]>;
}

class SlaRepository implements BaseModelsSlaRepository {
	retrieveDate(searchParams: { date: string }): Promise<Sla[]> {
		
		// query sql
		let query: string = "SELECT * FROM sites_sla_semeru";
		let condition: string = "";
		
		if (searchParams.date) condition += `date = '${searchParams.date}'`;

		if (condition.length) query += " WHERE " + condition;

		// return promise resolve or reject
		return new Promise((resolve, reject) => {
			connection.query<Sla[]>(query, (err, res) => {
				// if error reject
				if (err) reject(err);
				else {
					// if success resolve
					// and edit date format
					let data = JSON.parse(JSON.stringify(res));
					data.forEach((element: any) => {
						element.date = searchParams.date;
					});
					// send response
					resolve(data);
				}
			});
		});
	}
}

export default new SlaRepository();