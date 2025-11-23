import type { Ref } from "vue";
import { useOpenAIGlobal } from "./useOpenAIGlobal";

export const useWidgetMeta = <T extends Ref<Record<string, unknown>>>(): T => {
	return useOpenAIGlobal("toolResponseMetadata") as T;
};
