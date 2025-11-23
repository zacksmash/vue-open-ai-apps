import type { ExtractPropTypes } from "vue";

export const openAiProviderProps = {
	timeout: {
		type: Number,
		default: 15_000,
	},
	windowObject: {
		type: String,
		default: "openai",
	},
	autoStart: {
		type: Boolean,
		default: true,
	},
	pollingInterval: Number,
	loadingText: String,
	errorText: String,
	retryLabel: String,
	loadingClass: String,
	errorClass: String,
} satisfies Record<string, unknown>;

export type OpenAiProviderProps = ExtractPropTypes<typeof openAiProviderProps>;

export type OpenAiProviderEmits = {
	(event: "ready", payload: { duration: number }): void;
	(event: "loading", payload: { retry: () => Promise<void> }): void;
	(
		event: "error",
		payload: {
			message: string;
			retry: () => Promise<void>;
			cause?: unknown;
		},
	): void;
};
