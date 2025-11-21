import type { Signal, ReadonlySignal } from "@preact/signals-core";

export type ModelFactory<TModel, TFactoryArgs extends any[]> = (
	...args: TFactoryArgs
) => TModel;

export interface ModelConstructor<TModel, TFactoryArgs extends any[]> {
	new (...args: TFactoryArgs): Model<TModel>;
}

export type ModelValue =
	| Signal<unknown>
	| ReadonlySignal<unknown>
	| ((...args: any[]) => any);

export type ValidateModel<T> = {
	[K in keyof T]: T[K] extends ModelValue
		? T[K]
		: T[K] extends object
			? ValidateModel<T[K]>
			: `Error: ${K & string} must be a Signal, a function, or an object containing only Signals or functions`;
};

export type Model<TModel> = ValidateModel<TModel> & Disposable;

export interface Disposable {
	[Symbol.dispose](): void;
}

export declare const USE_ACTION_WRAPPER: unique symbol;
export type Action<Args extends unknown[], Return> = ((
	...args: Args
) => Return) & {
	readonly [USE_ACTION_WRAPPER]: true;
};
