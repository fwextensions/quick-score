export function clone(
	obj)
{
	return JSON.parse(JSON.stringify(obj));
}


export function compareLowercase(
	a = "",
	b = "")
{
	const lcA = a.toLocaleLowerCase();
	const lcB = b.toLocaleLowerCase();

	return lcA == lcB ? 0 : (lcA && lcA < lcB) ? -1 : 1;
}
