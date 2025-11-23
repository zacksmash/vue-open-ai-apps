import type { Ref } from "vue";
import type { UserAgent } from "../types";
import { useOpenAIGlobal } from "./useOpenAIGlobal";

export const useUserAgent = (): Ref<UserAgent | null> => {
	return useOpenAIGlobal("userAgent");
};
