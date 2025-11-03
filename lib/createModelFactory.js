import { batch, untracked } from "@preact/signals-core";
import { useState, useEffect } from "preact/hooks";

/**
 * @import { Signal, ReadonlySignal } from "@preact/signals-core"
 */

/**
 * @template {any[]} Args
 * @template Return
 * @typedef {(...args: Args) => Return} Action
 */

/**
 * @template {any[]} Args
 * @template Return
 * @param {(...args: Args) => Return} fn
 * @returns {Action<Args, Return>}
 */
export function action(fn) {
	return (...args) => {
		return batch(() => untracked(() => fn(...args)));
	};
}

/**
 * @template {{ [key: string]: Signal<unknown> }} TState
 * @template {{ [key: string]: ReadonlySignal<unknown> }} TViews
 * @template {{ [key: string]: Action<unknown[], unknown> }} TActions
 * @typedef ModelConfig
 * @property {TState} [state]
 * @property {TViews} [views]
 * @property {TActions} [actions]
 * @property {Record<string, Function>} [effects]
 */

/**
 * @template {{ [key: string]: Signal<unknown> }} TState
 * @template {{ [key: string]: ReadonlySignal<unknown> }} TViews
 * @template {{ [key: string]: Action<any[], unknown> }} TActions
 * @param {() => ModelConfig<TState, TViews, TActions>} factory
 * @returns {() => TState & TViews & TActions & { [Symbol.dispose]: () => void }}
 */
export function createModelFactory(factory) {
	return () => {
		const { state, views, actions, effects } = factory();
		return {
			...state,
			...views,
			...actions,
			[Symbol.dispose]() {
				if (effects) {
					for (const key of Object.keys(effects)) {
						effects[key]();
					}
				}
			}
		};
	};
}

/**
 * @template TReturn
 * @param {() => TReturn} createModel
 * @returns {TReturn}
 */
export function useModel(createModel) {
	const [model] = useState(() => createModel());
	useEffect(() => {
		return () => {
			model[Symbol.dispose]();
		};
	}, [model]);
	return model;
}

// import { batch, untracked } from "@preact/signals-core";
// import type { Signal, ReadonlySignal, effect } from "@preact/signals-core";

// interface Disposable {
// 	[Symbol.dispose](): void;
// }

// export type EffectDispose = ReturnType<typeof effect>;

// declare const USE_ACTION_WRAPPER: unique symbol;
// export type Action<Args extends unknown[], Return> = ((
// 	...args: Args
// ) => Return) & {
// 	readonly [USE_ACTION_WRAPPER]: true;
// };

// export function action<Args extends unknown[], Return>(
// 	fn: (...args: Args) => Return,
// ): Action<Args, Return> {
// 	return ((...args: Args) => {
// 		return batch(() => untracked(() => fn(...args)));
// 	}) as Action<Args, Return>;
// }

// export interface ModelConfig<
// 	TState extends { [key: string]: Signal<unknown> },
// 	TViews extends { [key: string]: ReadonlySignal<unknown> },
// 	TActions extends { [key: string]: Action<unknown[], unknown> },
// > {
// 	state: TState;
// 	views?: TViews;
// 	actions?: TActions;
// 	effects?: Record<string, EffectDispose>;
// }

// export function createModelFactory<
// 	TState extends { [key: string]: Signal<unknown> },
// 	TViews extends { [key: string]: ReadonlySignal<unknown> },
// 	TActions extends { [key: string]: Action<any[], unknown> },
// >(
// 	factory: () => ModelConfig<TState, TViews, TActions>,
// ): () => TState & TViews & TActions & Disposable {
// 	return () => {
// 		const { state, views, actions, effects } = factory();
// 		return {
// 			...state,
// 			...views,
// 			...actions,
// 			[Symbol.dispose]() {
// 				if (effects) {
// 					for (const key of Object.keys(effects)) {
// 						effects[key]();
// 					}
// 				}
// 			},
// 		} as TState & TViews & TActions & Disposable;
// 	};
// }
