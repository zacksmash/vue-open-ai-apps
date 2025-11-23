import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

type LifecycleQueues = {
	mounted: Array<() => void>;
	beforeUnmount: Array<() => void>;
};

type GlobalRuntime = typeof globalThis & { __vueLifecycle?: LifecycleQueues };

vi.mock("vue", () => {
	const lifecycle: LifecycleQueues = {
		mounted: [],
		beforeUnmount: [],
	};
	(globalThis as GlobalRuntime).__vueLifecycle = lifecycle;

	return {
		ref: <T>(value: T) => ({ value }),
		onMounted: (cb: () => void) => {
			lifecycle.mounted.push(cb);
		},
		onBeforeUnmount: (cb: () => void) => {
			lifecycle.beforeUnmount.push(cb);
		},
	};
});

import { ref } from "vue";
import { useCallTool } from "./methods/useCallTool";
import { useOpenAiReady } from "./methods/useOpenAiReady";
import { useOpenExternal } from "./methods/useOpenExternal";
import { useRequestDisplayMode } from "./methods/useRequestDisplayMode";
import { useRequestModal } from "./methods/useRequestModal";
import { useSendFollowUpMessage } from "./methods/useSendFollowUpMessage";
import { useWidgetState } from "./methods/useWidgetState";
import { useDisplayMode } from "./properties/useDisplayMode";
import { useLocale } from "./properties/useLocale";
import { useMaxHeight } from "./properties/useMaxHeight";
import * as openAiGlobalModule from "./properties/useOpenAiGlobal";
import { useSafeArea } from "./properties/useSafeArea";
import { useTheme } from "./properties/useTheme";
import { useUserAgent } from "./properties/useUserAgent";
import { useWidgetMeta } from "./properties/useWidgetMeta";
import { useWidgetParams } from "./properties/useWidgetParams";
import { useWidgetProps } from "./properties/useWidgetProps";
import {
	type CallTool,
	type OpenAiGlobals,
	type RequestDisplayMode,
	type RequestModal,
	SET_GLOBALS_EVENT_TYPE,
	type SetGlobalsEvent,
	type UnknownObject,
} from "./types";

declare global {
	// eslint-disable-next-line no-var
	var __vueLifecycle: LifecycleQueues | undefined;
}

type DefaultOpenAiGlobals = OpenAiGlobals<
	UnknownObject,
	UnknownObject,
	UnknownObject,
	UnknownObject
>;

type OpenAiApi = DefaultOpenAiGlobals & {
	callTool: CallTool;
	sendFollowUpMessage: (args: { prompt: string }) => Promise<void>;
	openExternal: (payload: { href: string }) => void;
	requestDisplayMode: RequestDisplayMode;
	requestModal: RequestModal;
};

type WindowWithOpenAi = Window &
	typeof globalThis & {
		openai: OpenAiApi;
	};

const propertyCases: Array<{
	name: string;
	fn: () => unknown;
	key: keyof DefaultOpenAiGlobals;
}> = [
	{ name: "useDisplayMode", fn: useDisplayMode, key: "displayMode" },
	{ name: "useLocale", fn: useLocale, key: "locale" },
	{ name: "useMaxHeight", fn: useMaxHeight, key: "maxHeight" },
	{ name: "useSafeArea", fn: useSafeArea, key: "safeArea" },
	{ name: "useTheme", fn: useTheme, key: "theme" },
	{ name: "useUserAgent", fn: useUserAgent, key: "userAgent" },
	{ name: "useWidgetMeta", fn: useWidgetMeta, key: "toolResponseMetadata" },
	{ name: "useWidgetParams", fn: useWidgetParams, key: "toolInput" },
	{ name: "useWidgetProps", fn: useWidgetProps, key: "toolOutput" },
];

let windowStub: WindowWithOpenAi;
let originalWindow: typeof window;

beforeEach(() => {
	windowStub = createWindowStub();
	originalWindow = globalThis.window;
	(globalThis as typeof globalThis & { window: WindowWithOpenAi }).window =
		windowStub;
	resetLifecycle();
});

afterEach(() => {
	(globalThis as typeof globalThis & { window: Window | undefined }).window =
		originalWindow;
	vi.restoreAllMocks();
	resetLifecycle();
});

describe("method helpers", () => {
	it("useCallTool delegates to window.openai", async () => {
		const callToolMock = vi.fn().mockResolvedValue({ result: "completed" });
		window.openai.callTool = callToolMock as typeof window.openai.callTool;

		const callTool = useCallTool();
		const response = await callTool("status", { ready: true });

		expect(callToolMock).toHaveBeenCalledWith("status", { ready: true });
		expect(response).toEqual({ result: "completed" });
	});

	it("useCallTool logs and rethrows errors", async () => {
		const error = new Error("boom");
		const callToolMock = vi.fn().mockRejectedValue(error);
		const consoleSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		window.openai.callTool = callToolMock as typeof window.openai.callTool;

		await expect(useCallTool()("broken", {})).rejects.toThrow(error);
		expect(consoleSpy).toHaveBeenCalledWith("callTool failed", error);
	});

	it("useOpenExternal forwards href", () => {
		const openExternalMock = vi.fn();
		window.openai.openExternal = openExternalMock;

		const openExternal = useOpenExternal();
		openExternal("https://example.com");

		expect(openExternalMock).toHaveBeenCalledWith({
			href: "https://example.com",
		});
	});

	it("useRequestDisplayMode requests target mode", async () => {
		const requestMock = vi.fn().mockResolvedValue({ mode: "fullscreen" });
		window.openai.requestDisplayMode =
			requestMock as typeof window.openai.requestDisplayMode;

		const requestDisplayMode = useRequestDisplayMode();
		await requestDisplayMode("fullscreen");

		expect(requestMock).toHaveBeenCalledWith({ mode: "fullscreen" });
	});

	it("useRequestModal invokes platform modal", async () => {
		const requestModalMock = vi.fn().mockResolvedValue(undefined);
		window.openai.requestModal = requestModalMock;

		const requestModal = useRequestModal();
		await requestModal("Details");

		expect(requestModalMock).toHaveBeenCalledWith("Details");
	});

	it("useSendFollowUpMessage sends prompt", async () => {
		const sendMock = vi.fn().mockResolvedValue(undefined);
		window.openai.sendFollowUpMessage = sendMock;

		const sendFollowUpMessage = useSendFollowUpMessage();
		await sendFollowUpMessage("Ping");

		expect(sendMock).toHaveBeenCalledWith({ prompt: "Ping" });
	});

	it("useWidgetState updates refs and host state", async () => {
		const widgetStateRef = ref<{ ready: boolean } | null>({ ready: false });
		const openAiSpy = vi
			.spyOn(openAiGlobalModule, "useOpenAiGlobal")
			.mockReturnValue(widgetStateRef as never);
		const setStateMock = vi.fn().mockResolvedValue(undefined);
		window.openai.setWidgetState = setStateMock;

		const { widgetState, setWidgetState } = useWidgetState<{
			ready: boolean;
		}>();
		await setWidgetState({ ready: true });

		expect(widgetState).toBe(widgetStateRef);
		expect(widgetState.value).toEqual({ ready: true });
		expect(setStateMock).toHaveBeenCalledWith({ ready: true });

		openAiSpy.mockRestore();
	});

	it("useWidgetState is a no-op when host API is missing", async () => {
		const widgetStateRef = ref<{ count: number } | null>(null);
		const openAiSpy = vi
			.spyOn(openAiGlobalModule, "useOpenAiGlobal")
			.mockReturnValue(widgetStateRef as never);
		// @ts-expect-error - simulate missing host method
		window.openai.setWidgetState = undefined;

		const { setWidgetState } = useWidgetState<{ count: number }>();
		await setWidgetState({ count: 1 });

		expect(widgetStateRef.value).toBeNull();

		openAiSpy.mockRestore();
	});

	it("useWidgetState logs failures from host", async () => {
		const widgetStateRef = ref<{ id: string } | null>(null);
		const openAiSpy = vi
			.spyOn(openAiGlobalModule, "useOpenAiGlobal")
			.mockReturnValue(widgetStateRef as never);
		const error = new Error("fail");
		const consoleSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => undefined);
		const setStateMock = vi.fn().mockRejectedValue(error);
		window.openai.setWidgetState = setStateMock;

		const { setWidgetState } = useWidgetState<{ id: string }>();
		await setWidgetState({ id: "123" });

		expect(widgetStateRef.value).toEqual({ id: "123" });
		expect(consoleSpy).toHaveBeenCalledWith("setWidgetState failed", error);

		openAiSpy.mockRestore();
	});
});

describe("property helpers", () => {
	for (const { name, fn, key } of propertyCases) {
		it(`${name} proxies to useOpenAiGlobal(${key})`, () => {
			const stubRef = ref(null);
			const spy = vi
				.spyOn(openAiGlobalModule, "useOpenAiGlobal")
				.mockReturnValue(stubRef as never);

			const result = fn();

			expect(result).toBe(stubRef);
			expect(spy).toHaveBeenCalledWith(key);

			spy.mockRestore();
		});
	}
});

describe("useOpenAiGlobal", () => {
	it("returns a ref seeded with the current global value", () => {
		window.openai.locale = "fr";

		const state = openAiGlobalModule.useOpenAiGlobal("locale");

		expect(state.value).toBe("fr");
	});

	it("subscribes to global updates and refreshes the ref", () => {
		window.openai.displayMode = "inline";
		const state = openAiGlobalModule.useOpenAiGlobal("displayMode");
		flushMounted();

		window.openai.displayMode = "fullscreen";
		window.dispatchEvent(
			new CustomEvent(SET_GLOBALS_EVENT_TYPE, {
				detail: { globals: { displayMode: "fullscreen" } },
			}) as SetGlobalsEvent,
		);

		expect(state.value).toBe("fullscreen");
	});

	it("ignores events that do not include the observed key", () => {
		window.openai.locale = "en";
		const state = openAiGlobalModule.useOpenAiGlobal("locale");
		flushMounted();

		window.dispatchEvent(
			new CustomEvent(SET_GLOBALS_EVENT_TYPE, {
				detail: { globals: { displayMode: "pip" } },
			}) as SetGlobalsEvent,
		);

		expect(state.value).toBe("en");
	});

	it("cleans up listeners on unmount", () => {
		const removeSpy = vi.spyOn(window, "removeEventListener");
		openAiGlobalModule.useOpenAiGlobal("locale");
		flushMounted();

		flushBeforeUnmount();

		expect(removeSpy).toHaveBeenCalledWith(
			SET_GLOBALS_EVENT_TYPE,
			expect.any(Function),
		);
	});
});

describe("useOpenAiReady", () => {
	it("marks ready when the bridge already exists", async () => {
		const hook = useOpenAiReady({
			autoStart: false,
			timeout: 50,
			pollingInterval: 0,
		});
		await hook.start();
		expect(hook.ready.value).toBe(true);
		expect(hook.errorMessage.value).toBeNull();
	});

	it("surfaces timeout errors when the bridge is missing", async () => {
		// @ts-expect-error - simulate unavailable callTool API
		window.openai.callTool = undefined;
		const hook = useOpenAiReady({
			autoStart: false,
			timeout: 5,
			pollingInterval: 0,
		});
		await hook.start();
		expect(hook.ready.value).toBe(false);
		expect(hook.errorMessage.value).toBe("OpenAI SDK timeout");
	});

	it("recovers once the bridge becomes available", async () => {
		// @ts-expect-error - simulate unavailable callTool API
		window.openai.callTool = undefined;
		const hook = useOpenAiReady({
			autoStart: false,
			timeout: 50,
			pollingInterval: 0,
		});

		setTimeout(() => {
			window.openai.callTool = vi
				.fn(async () => ({ result: "ok" }))
				.bind(window.openai) as typeof window.openai.callTool;
		}, 0);

		await hook.start();
		expect(hook.ready.value).toBe(true);
		expect(hook.errorMessage.value).toBeNull();
	});
});

function flushMounted() {
	const lifecycle = globalThis.__vueLifecycle;
	if (!lifecycle) return;
	while (lifecycle.mounted.length) {
		lifecycle.mounted.shift()?.();
	}
}

function flushBeforeUnmount() {
	const lifecycle = globalThis.__vueLifecycle;
	if (!lifecycle) return;
	while (lifecycle.beforeUnmount.length) {
		lifecycle.beforeUnmount.shift()?.();
	}
}

function resetLifecycle() {
	const lifecycle = globalThis.__vueLifecycle;
	if (!lifecycle) return;
	lifecycle.mounted.length = 0;
	lifecycle.beforeUnmount.length = 0;
}

function createWindowStub(
	overrides: Partial<OpenAiApi> = {},
): WindowWithOpenAi {
	const target = new EventTarget() as WindowWithOpenAi;
	target.openai = buildOpenAiStub(overrides);
	target.setTimeout = globalThis.setTimeout.bind(globalThis);
	target.clearTimeout = globalThis.clearTimeout.bind(globalThis);
	target.requestAnimationFrame = ((cb: FrameRequestCallback) => {
		const handle = globalThis.setTimeout(() => cb(Date.now()), 16);
		return handle as unknown as number;
	}) as typeof window.requestAnimationFrame;
	target.cancelAnimationFrame = (handle: number) => {
		globalThis.clearTimeout(handle as unknown as number);
	};
	return target;
}

function buildOpenAiStub(overrides: Partial<OpenAiApi> = {}): OpenAiApi {
	const base: OpenAiApi = {
		callTool: vi.fn<CallTool>(async () => ({ result: "ok" })),
		sendFollowUpMessage: vi.fn<(args: { prompt: string }) => Promise<void>>(
			async () => undefined,
		),
		openExternal: vi.fn<(payload: { href: string }) => void>(() => undefined),
		requestDisplayMode: vi.fn<RequestDisplayMode>(async ({ mode }) => ({
			mode,
		})),
		requestModal: vi.fn<RequestModal>(async () => undefined),
		theme: "light",
		userAgent: {
			device: { type: "desktop" },
			capabilities: { hover: true, touch: false },
		},
		locale: "en-US",
		maxHeight: 480,
		displayMode: "inline",
		safeArea: { insets: { top: 0, bottom: 0, left: 0, right: 0 } },
		toolInput: { initial: true } as UnknownObject,
		toolOutput: null,
		toolResponseMetadata: null,
		widgetState: null,
		setWidgetState: vi.fn<
			(state: DefaultOpenAiGlobals["widgetState"]) => Promise<void>
		>(async () => undefined),
	};

	return { ...base, ...overrides };
}
