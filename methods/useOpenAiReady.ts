import "../types";
import { onBeforeUnmount, onMounted, type Ref, ref } from "vue";

export type UseOpenAiReadyOptions = {
	timeout?: number;
	windowObject?: string;
	pollingInterval?: number;
	autoStart?: boolean;
};

export type UseOpenAiReadyReturn = {
	ready: Ref<boolean>;
	errorMessage: Ref<string | null>;
	lastError: Ref<unknown>;
	lastDuration: Ref<number | null>;
	isLoading: Ref<boolean>;
	start: () => Promise<void>;
	reset: () => void;
};

const DEFAULT_TIMEOUT = 15_000;
const DEFAULT_INTERVAL = 16;

export function useOpenAiReady(
	options: UseOpenAiReadyOptions = {},
): UseOpenAiReadyReturn {
	const ready = ref(false);
	const errorMessage = ref<string | null>(null);
	const lastError = ref<unknown>(null);
	const lastDuration = ref<number | null>(null);
	const isLoading = ref(false);

	let running = false;
	let disposed = false;

	const resolved = {
		timeout: options.timeout ?? DEFAULT_TIMEOUT,
		windowObject: options.windowObject ?? "openai",
		pollingInterval: options.pollingInterval,
		autoStart: options.autoStart ?? true,
	};

	const now = () =>
		typeof performance !== "undefined" && typeof performance.now === "function"
			? performance.now()
			: Date.now();

	const getBridge = () => {
		if (typeof window === "undefined") return undefined;
		const target = window as unknown as Record<string, unknown>;
		return target[resolved.windowObject] as Window["openai"] | undefined;
	};

	const hasBridge = () => {
		const bridge = getBridge();
		return !!(bridge && typeof bridge.callTool === "function");
	};

	const waitForBridge = () =>
		new Promise<void>((resolve, reject) => {
			if (typeof window === "undefined") {
				reject(new Error("window is not defined"));
				return;
			}

			const begin = now();

			const request = () => {
				if (disposed) {
					reject(new Error("OpenAI readiness watcher was disposed"));
					return;
				}

				if (hasBridge()) {
					resolve();
					return;
				}

				if (now() - begin > resolved.timeout) {
					reject(new Error("OpenAI SDK timeout"));
					return;
				}

				schedule(request);
			};

			schedule(request);
		});

	const schedule = (callback: () => void) => {
		if (typeof window === "undefined") {
			setTimeout(callback, resolved.pollingInterval ?? DEFAULT_INTERVAL);
			return;
		}

		if (resolved.pollingInterval !== undefined) {
			window.setTimeout(callback, resolved.pollingInterval);
			return;
		}

		if (typeof window.requestAnimationFrame === "function") {
			window.requestAnimationFrame(callback);
			return;
		}

		window.setTimeout(callback, DEFAULT_INTERVAL);
	};

	const start = async () => {
		if (running || ready.value) return;

		running = true;
		isLoading.value = true;
		errorMessage.value = null;
		lastError.value = null;

		const startedAt = now();

		try {
			await waitForBridge();
			ready.value = true;
			lastDuration.value = now() - startedAt;
		} catch (error) {
			lastError.value = error;
			errorMessage.value =
				error instanceof Error
					? error.message
					: "OpenAI bridge failed to initialize";
			ready.value = false;
		} finally {
			running = false;
			isLoading.value = false;
		}
	};

	const reset = () => {
		ready.value = false;
		errorMessage.value = null;
		lastError.value = null;
		lastDuration.value = null;
	};

	if (resolved.autoStart) {
		onMounted(() => {
			void start();
		});
	}

	onBeforeUnmount(() => {
		disposed = true;
	});

	return {
		ready,
		errorMessage,
		lastError,
		lastDuration,
		isLoading,
		start,
		reset,
	};
}
