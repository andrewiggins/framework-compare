const isDebug = process.env.PPTR_DEBUG === "true";

module.exports = {
	launch: {
		headless: !isDebug,
		devtools: isDebug
	}
};
