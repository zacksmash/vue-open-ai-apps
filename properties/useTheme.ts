import type { Ref } from "vue";
import type { Theme } from "../types";
import { useOpenAIGlobal } from "./useOpenAIGlobal";

export const useTheme = (): Ref<Theme | null> => {
	return useOpenAIGlobal("theme");
};
