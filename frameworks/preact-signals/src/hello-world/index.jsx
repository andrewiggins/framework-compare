import { render } from "preact";
import { createModelFactory } from "../../../../lib/createModelFactory";
import { signal } from "@preact/signals";

const createMessageModel = createModelFactory(() => {
	return { state: { message: signal("Hello World!") } };
});

const model = createMessageModel();

render(<div>{model.message}</div>, document.getElementById("app"));
