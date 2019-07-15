export function today() {
	const fullDate = new Date();
	let month = fullDate.getMonth() + 1;
	let date = fullDate.getDate();
	return [
		fullDate.getFullYear(),
		month < 10 ? "0" + month : month,
		date < 10 ? "0" + date : date
	].join("-");
}

const validDate = /^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})$/;

/**
 * @param {string} date
 */
export function validateDate(date) {
	if (date == null) {
		throw new Error("Invalid date. Date must be in the format of YYYY-MM-DD");
	}

	const match = date.match(validDate);
	if (match == null) {
		throw new Error("Invalid date. Date must be in the format of YYYY-MM-DD");
	}

	const year = parseInt(match[1]);
	const month = parseInt(match[2]);
	const day = parseInt(match[3]);

	if (day < 1 || day > 31) {
		throw new Error("Invalid date. Date must be between 1-31.");
	}

	if (month < 1 || month > 12) {
		throw new Error("Invalid month. Month must be between 1-12.");
	}

	const parsedDate = new Date(date);

	if (day !== parsedDate.getUTCDate()) {
		throw new Error("Invalid date. Date isn't correct.");
	}

	if (month !== parsedDate.getUTCMonth() + 1) {
		throw new Error("Invalid date. Month isn't correct.");
	}

	if (year !== parsedDate.getUTCFullYear()) {
		throw new Error("Invalid date. Year isn't correct.");
	}
}
