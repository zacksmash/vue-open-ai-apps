import type { Ref } from "vue";
import type { SafeArea } from "../types";
import { useOpenAIGlobal } from "./useOpenAIGlobal";

export const useSafeArea = (): Ref<SafeArea | null> => {
	return useOpenAIGlobal("safeArea");
};
