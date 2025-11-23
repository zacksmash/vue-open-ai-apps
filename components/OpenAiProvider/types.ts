import type { ExtractPropTypes } from "vue";

export const openAIProviderProps = {
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

export type OpenAIProviderProps = ExtractPropTypes<typeof openAIProviderProps>;

export type OpenAIProviderEmits = {
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
