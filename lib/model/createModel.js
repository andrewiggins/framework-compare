import { batch, untracked } from "@preact/signals-core";
import { useState, useEffect } from "preact/hooks";
import { startEffectCapture } from "./effectCapture.js";

/**
 * @import { Action, ModelConstructor, ModelFactory, Model, ValidateModel } from "./types.d.ts"
 */

const disposeSymbol = Symbol.for("Symbol.dispose");

/**
 * @template {unknown[]} Args
 * @template Return
 * @param {(...args: Args) => Return} fn
 * @returns {Action<Args, Return>}
 */
export function action(fn) {
	const action = /** @type {Action<Args, Return>} */ (
		(...args) => {
			return batch(() => untracked(() => fn(...args)));
		}
	);

	return action;
}

/**
 * @template TModel
 * @template {any[]} TFactoryArgs
 * @param {ModelFactory<ValidateModel<TModel>, TFactoryArgs>} factory
 * @returns {ModelConstructor<TModel, TFactoryArgs>}
 */
export function createModel(factory) {
	/**
	 * @class SignalModel
	 * @param {TFactoryArgs} args
	 */
	function SignalModel(...args) {
		const { capturedEffects, stopEffectCapture } = startEffectCapture();

		/** @type {Model<TModel>} */
		let model;
		try {
			model = /** @type {Model<TModel>} */ (factory(...args));
		} finally {
			stopEffectCapture();
		}

		for (const i in model) {
			if (typeof model[i] === "function") {
				model[i] = action(model[i]);
			}
		}

		model[disposeSymbol] = () => {
			for (const effectInstance of capturedEffects) {
				effectInstance.dispose();
			}
			capturedEffects.clear();
		};

		return model;
	}

	// @ts-expect-error – TS cannot infer constructor signatures from functions
	return SignalModel;
}

/**
 * @template TModel
 * @param {ModelConstructor<TModel, []> | (() => Model<TModel>)} factory
 * @returns {Model<TModel>}
 */
export function useModel(factory) {
	// @ts-expect-error – Using internal knowledge to know this is safe
	const [inst] = useState(() => factory());
	useEffect(() => inst[disposeSymbol], [inst]);
	return inst;
}
