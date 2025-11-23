import type { Ref } from "vue";
import type { DisplayMode } from "../types";
import { useOpenAIGlobal } from "./useOpenAIGlobal";

export const useDisplayMode = (): Ref<DisplayMode | null> => {
	return useOpenAIGlobal("displayMode");
};
