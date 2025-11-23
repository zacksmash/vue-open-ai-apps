import type { Ref } from "vue";
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export const useWidgetParams = <T extends Ref<Record<string, unknown>>>() => {
	return useOpenAiGlobal("toolInput") as T;
};
