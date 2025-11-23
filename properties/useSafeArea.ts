import type { Ref } from "vue";
import type { SafeArea } from "../types";
import { useOpenAiGlobal } from "./useOpenAiGlobal";

export const useSafeArea = (): Ref<SafeArea | null> => {
	return useOpenAiGlobal("safeArea");
};
