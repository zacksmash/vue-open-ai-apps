import { onBeforeUnmount, onMounted, type Ref, ref } from "vue";
import {
	type OpenAIGlobals,
	SET_GLOBALS_EVENT_TYPE,
	type SetGlobalsEvent,
} from "../types";

export function useOpenAIGlobal<K extends keyof OpenAIGlobals>(
	key: K,
): Ref<OpenAIGlobals[K]> {
	const state = ref((window.openai as OpenAIGlobals)[key]);

	const onChange = () => {
		state.value =
			typeof window !== "undefined" && (window.openai as OpenAIGlobals)[key];
	};

	let handleSetGlobal: ((event: SetGlobalsEvent) => void) | null = null;

	onMounted(() => {
		onChange();

		handleSetGlobal = (event: SetGlobalsEvent) => {
			const value = event.detail.globals[key];
			if (value === undefined) return;
			onChange();
		};

		window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
			passive: true,
		});
	});

	onBeforeUnmount(() => {
		if (handleSetGlobal) {
			window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
			handleSetGlobal = null;
		}
	});

	return state as Ref<OpenAIGlobals[K]>;
}
