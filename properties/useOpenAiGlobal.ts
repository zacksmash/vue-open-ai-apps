import { onBeforeUnmount, onMounted, type Ref, ref } from "vue";
import {
	type OpenAiGlobals,
	SET_GLOBALS_EVENT_TYPE,
	type SetGlobalsEvent,
} from "../types";

export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
	key: K,
): Ref<OpenAiGlobals[K]> {
	const state = ref((window.openai as OpenAiGlobals)[key]);

	const onChange = () => {
		state.value =
			typeof window !== "undefined" && (window.openai as OpenAiGlobals)[key];
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

	return state as Ref<OpenAiGlobals[K]>;
}
