import type { Ref } from "vue";
import { useOpenAiGlobal } from "../properties/useOpenAiGlobal";
import type { OpenAiGlobals, UnknownObject } from "../types";

export function useWidgetState<T extends OpenAiGlobals["widgetState"]>() {
	const widgetState = useOpenAiGlobal("widgetState") as Ref<T | null>;

	async function setWidgetState(next: T): Promise<void> {
		if (
			typeof window === "undefined" ||
			!window.openai?.setWidgetState ||
			typeof window.openai?.setWidgetState !== "function"
		)
			return;

		widgetState.value = next;

		try {
			await window.openai?.setWidgetState(next as UnknownObject);
		} catch (err) {
			console.error("setWidgetState failed", err);
		}
	}

	return { widgetState, setWidgetState } as {
		widgetState: typeof widgetState;
		setWidgetState: typeof setWidgetState;
	};
}
