import type { Ref } from "vue";
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export const useWidgetProps = <T extends Ref<Record<string, unknown>>>(): T => {
	return useOpenAiGlobal("toolOutput") as T;
};
