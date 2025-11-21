import { render } from "preact";
import { createModel } from "../../../../lib/model/createModel.js";
import { signal } from "@preact/signals";

const MessageModel = createModel(() => {
	return { message: signal("Hello World!") };
});

const model = new MessageModel();

render(<div>{model.message}</div>, document.getElementById("app"));
