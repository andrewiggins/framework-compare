/**
 * @param {import('./index').Person} person
 */
export function getDisplayName(person) {
	return `${person.surname}, ${person.name}`;
}

export const EMPTY_PERSON = Object.freeze({
	id: null,
	name: "",
	surname: ""
});
