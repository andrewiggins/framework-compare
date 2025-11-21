import { effect } from "@preact/signals-core";

/**
 * @typedef Effect
 * @property {() => void} dispose dispose()
 */

/**
 * @typedef {Object} CapturedEffects
 * @property {Set<Effect>} capturedEffects
 * @property {() => void} stopEffectCapture
 */

/** @type {object | null} */
let EffectPrototypeCache = null;

/** @type {() => object} */
function getEffectPrototype() {
	if (!EffectPrototypeCache) {
		/** @type {Effect | undefined} */
		let effectInstance;
		effect(function () {
			effectInstance = this;
		});

		if (!effectInstance) {
			throw new Error("Failed to initialize effect for prototype retrieval.");
		}

		EffectPrototypeCache = Object.getPrototypeOf(effectInstance);
		if (!EffectPrototypeCache) {
			throw new Error("Failed to retrieve effect prototype.");
		}
	}

	return EffectPrototypeCache;
}

/**
 * The minified property on the Effect class that is set by in the Effect constructor.
 *
 * I'd like to use the `name` property since it is only used by DevTools to identify
 * this effect and is otherwise unused. Ideally, overriding the `name` property
 * would have no performance impact, since it is only read by DevTools, but our
 * version of Preact Signals doesn't support `name` yet.
 */
const EFFECT_PROPERTY_KEY = "x";
const DEFAULT_DESCRIPTOR = {
	configurable: true,
	get() {
		return this.__capturedPropValue;
	},
	set(value) {
		this.__capturedPropValue = value;
	}
};

/**
 * Starts capturing effects that are created or modified.
 * @returns {CapturedEffects}
 */
export function startEffectCapture() {
	let capturing = true;
	/** @type {Set<Effect>} */
	const capturedEffects = new Set();

	const EffectPrototype = getEffectPrototype();
	const previousDescriptor = Object.getOwnPropertyDescriptor(
		EffectPrototype,
		EFFECT_PROPERTY_KEY
	);
	Object.defineProperty(EffectPrototype, EFFECT_PROPERTY_KEY, {
		configurable: true,
		get: DEFAULT_DESCRIPTOR.get,
		set(value) {
			if (capturing) {
				capturedEffects.add(this);
			}

			// If there was no previous descriptor, just call the default setter.
			if (!previousDescriptor) {
				DEFAULT_DESCRIPTOR.set.call(this, value);
				return;
			}

			// If the previous descriptor is another effect capture descriptor (marked by
			// having a getter that is equal to our default getter), we need to call its
			// setter so it is also captures the effect.
			if (
				previousDescriptor.get === DEFAULT_DESCRIPTOR.get &&
				typeof previousDescriptor.set === "function"
			) {
				previousDescriptor.set.call(this, value);
				return;
			}

			// If the previous descriptor is not an effect capture descriptor, we call our default setter.
			DEFAULT_DESCRIPTOR.set.call(this, value);
		}
	});

	return {
		capturedEffects,
		stopEffectCapture() {
			capturing = false;
			Object.defineProperty(
				EffectPrototype,
				EFFECT_PROPERTY_KEY,
				previousDescriptor ?? DEFAULT_DESCRIPTOR
			);
		}
	};
}
