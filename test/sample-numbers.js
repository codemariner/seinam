/**
 * Contains sample number values and what the expected parsed number
 * should look like. Add additional numbers as needed to ensure expected
 * parsing behavior and validate by running tests.
 */
module.exports = {
	'+14346619090': '4346619090',
	'+1 434 661 9090': '4346619090',
	'  +1  434 661 9  090  ': '4346619090',
	'434-661-9090': '4346619090',
	'(434)661-9090': '4346619090',
	'434-661-9090x1234': '4346619090',
	'434-661-9090 x1234': '4346619090',
	'434-661-9090 ext1234': '4346619090',
	'+524567891234': '524567891234',
	'+011524567891234': '524567891234',
	'14341231234': '4341231234',
	'asdfasdfasdf': Error,
	'12345678901234567890': Error // too long to be a phone number
};
