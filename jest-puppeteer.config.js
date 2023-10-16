const isDebug = process.env.PPTR_DEBUG === "true";

module.exports = {
	launch: {
		headless: isDebug ? false : "new",
		devtools: isDebug
	}
};
