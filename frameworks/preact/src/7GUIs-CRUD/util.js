/**
 * @param {import('lib/crud').Person} person
 */
export function getDisplayName(person) {
	return `${person.surname}, ${person.name}`;
}

/** @type {import('lib/crud').Person} */
export const EMPTY_PERSON = Object.freeze({
	id: null,
	name: "",
	surname: ""
});
