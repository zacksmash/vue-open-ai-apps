import type { Ref } from "vue";
import { useOpenAIGlobal } from "./useOpenAIGlobal";

export const useWidgetParams = <T extends Ref<Record<string, unknown>>>() => {
	return useOpenAIGlobal("toolInput") as T;
};
