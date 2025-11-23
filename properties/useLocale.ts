import type { Ref } from "vue";
import { useOpenAIGlobal } from "./useOpenAIGlobal";

export const useLocale = (): Ref<string | null> => {
	return useOpenAIGlobal("locale");
};
