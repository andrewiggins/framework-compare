const isDebug = process.env.PPTR_DEBUG === "true";

export default {
	launch: {
		headless: isDebug ? false : "new",
		devtools: isDebug
	}
};
