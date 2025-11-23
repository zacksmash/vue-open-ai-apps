import type { Ref } from "vue";
import { useOpenAIGlobal } from "../properties/useOpenAIGlobal";
import type { OpenAIGlobals, UnknownObject } from "../types";

export function useWidgetState<T extends OpenAIGlobals["widgetState"]>() {
	const widgetState = useOpenAIGlobal("widgetState") as Ref<T | null>;

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
