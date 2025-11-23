import type { Ref } from "vue";
import { useOpenAIGlobal } from "./useOpenAIGlobal";

export const useMaxHeight = (): Ref<number | null> => {
	return useOpenAIGlobal("maxHeight");
};
