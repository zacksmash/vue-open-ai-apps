import type { Ref } from "vue";
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export const useWidgetMeta = <T extends Ref<Record<string, unknown>>>(): T => {
	return useOpenAiGlobal("toolResponseMetadata") as T;
};
