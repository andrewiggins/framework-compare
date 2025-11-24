import { validateDate, today } from "../../lib/date";

describe("date lib", () => {
	describe("today()", () => {
		it("returns a valid date", () => {
			expect(() => validateDate(today())).not.toThrow();
		});
	});

	describe("validateDate", () => {
		it("does not throw errors on valid date formats", () => {
			expect(() => validateDate("2018-09-12")).not.toThrow();
			expect(() => validateDate("2019-02-28")).not.toThrow();
			expect(() => validateDate("2024-02-29")).not.toThrow();
		});

		it("throws helpful errors on invalid date formats", () => {
			expect(() => validateDate(null)).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("-")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("--")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("---")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234--")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234-09-")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("-09-")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234--01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("123-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("12-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("2019-1-12")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("2018-09-2")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("2019-1-2")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("12345-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("a1234-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1a234-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("12a34-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("123a4-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234a-09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234-a09-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234-0a9-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234-09a-01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234-09-a01")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234-09-0a1")).toThrow(/YYYY-MM-DD/);
			expect(() => validateDate("1234-09-01a")).toThrow(/YYYY-MM-DD/);
		});

		it("throws helpful errors on invalid dates", () => {
			expect(() => validateDate("2019-12-32")).toThrow(/Date/);
			expect(() => validateDate("2019-4-31")).toThrow(/Date/);
			expect(() => validateDate("2019-02-29")).toThrow(/Date/);
			expect(() => validateDate("2019-13-01")).toThrow(/Month/);
		});
	});
});
