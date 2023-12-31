// FILE GENERATED WITH SCRIPT
/** @type {import('../../../shared/types.d.ts').NamedFlatConfig} */
export default {
	name: 'airbnb:node',
	languageOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
		parserOptions: { ecmaFeatures: { globalReturn: true } },
		globals: {
			AggregateError: false,
			Array: false,
			ArrayBuffer: false,
			Atomics: false,
			BigInt: false,
			BigInt64Array: false,
			BigUint64Array: false,
			Boolean: false,
			constructor: false,
			DataView: false,
			Date: false,
			decodeURI: false,
			decodeURIComponent: false,
			encodeURI: false,
			encodeURIComponent: false,
			Error: false,
			escape: false,
			eval: false,
			EvalError: false,
			FinalizationRegistry: false,
			Float32Array: false,
			Float64Array: false,
			Function: false,
			globalThis: false,
			hasOwnProperty: false,
			Infinity: false,
			Int16Array: false,
			Int32Array: false,
			Int8Array: false,
			isFinite: false,
			isNaN: false,
			isPrototypeOf: false,
			JSON: false,
			Map: false,
			Math: false,
			NaN: false,
			Number: false,
			Object: false,
			parseFloat: false,
			parseInt: false,
			Promise: false,
			propertyIsEnumerable: false,
			Proxy: false,
			RangeError: false,
			ReferenceError: false,
			Reflect: false,
			RegExp: false,
			Set: false,
			SharedArrayBuffer: false,
			String: false,
			Symbol: false,
			SyntaxError: false,
			toLocaleString: false,
			toString: false,
			TypeError: false,
			Uint16Array: false,
			Uint32Array: false,
			Uint8Array: false,
			Uint8ClampedArray: false,
			undefined: false,
			unescape: false,
			URIError: false,
			valueOf: false,
			WeakMap: false,
			WeakRef: false,
			WeakSet: false,
			__dirname: false,
			__filename: false,
			AbortController: false,
			AbortSignal: false,
			atob: false,
			Blob: false,
			BroadcastChannel: false,
			btoa: false,
			Buffer: false,
			ByteLengthQueuingStrategy: false,
			clearImmediate: false,
			clearInterval: false,
			clearTimeout: false,
			CompressionStream: false,
			console: false,
			CountQueuingStrategy: false,
			crypto: false,
			Crypto: false,
			CryptoKey: false,
			CustomEvent: false,
			DecompressionStream: false,
			DOMException: false,
			Event: false,
			EventTarget: false,
			exports: true,
			fetch: false,
			File: false,
			FormData: false,
			global: false,
			Headers: false,
			Intl: false,
			MessageChannel: false,
			MessageEvent: false,
			MessagePort: false,
			module: false,
			performance: false,
			PerformanceEntry: false,
			PerformanceMark: false,
			PerformanceMeasure: false,
			PerformanceObserver: false,
			PerformanceObserverEntryList: false,
			PerformanceResourceTiming: false,
			process: false,
			queueMicrotask: false,
			ReadableByteStreamController: false,
			ReadableStream: false,
			ReadableStreamBYOBReader: false,
			ReadableStreamBYOBRequest: false,
			ReadableStreamDefaultController: false,
			ReadableStreamDefaultReader: false,
			Request: false,
			require: false,
			Response: false,
			setImmediate: false,
			setInterval: false,
			setTimeout: false,
			structuredClone: false,
			SubtleCrypto: false,
			TextDecoder: false,
			TextDecoderStream: false,
			TextEncoder: false,
			TextEncoderStream: false,
			TransformStream: false,
			TransformStreamDefaultController: false,
			URL: false,
			URLSearchParams: false,
			WebAssembly: false,
			WritableStream: false,
			WritableStreamDefaultController: false,
			WritableStreamDefaultWriter: false,
		},
	},
	rules: {
		'node/callback-return': 'off',
		'node/global-require': 'error',
		'node/handle-callback-err': 'off',
		'node/no-mixed-requires': ['off', false],
		'node/no-new-require': 'error',
		'node/no-path-concat': 'error',
		'node/no-process-env': 'off',
		'node/no-process-exit': 'off',
		'node/no-sync': 'off',
		'node/no-hide-core-modules': 0,
		'node/no-unsupported-features': 0,
	},
};
