import type { Ref } from "vue";
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export const useMaxHeight = (): Ref<number | null> => {
	return useOpenAiGlobal("maxHeight");
};
