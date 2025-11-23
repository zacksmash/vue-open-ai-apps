import type { Ref } from "vue";
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export const useLocale = (): Ref<string | null> => {
	return useOpenAiGlobal("locale");
};
