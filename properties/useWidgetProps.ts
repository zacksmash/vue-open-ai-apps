import type { Ref } from "vue";
import { useOpenAIGlobal } from "./useOpenAIGlobal";

export const useWidgetProps = <T extends Ref<Record<string, unknown>>>(): T => {
	return useOpenAIGlobal("toolOutput") as T;
};
