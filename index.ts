import OpenAiProvider from "./components/OpenAiProvider/index.vue";
import { useCallTool } from "./methods/useCallTool";
import { useOpenAiReady } from "./methods/useOpenAiReady";
import { useOpenExternal } from "./methods/useOpenExternal";
import { useRequestDisplayMode } from "./methods/useRequestDisplayMode";
import { useRequestModal } from "./methods/useRequestModal";
import { useSendFollowUpMessage } from "./methods/useSendFollowUpMessage";
import { useWidgetState } from "./methods/useWidgetState";
import { useDisplayMode } from "./properties/useDisplayMode";
import { useLocale } from "./properties/useLocale";
import { useMaxHeight } from "./properties/useMaxHeight";
import { useOpenAiGlobal } from "./properties/useOpenAiGlobal";
import { useSafeArea } from "./properties/useSafeArea";
import { useTheme } from "./properties/useTheme";
import { useUserAgent } from "./properties/useUserAgent";
import { useWidgetMeta } from "./properties/useWidgetMeta";
import { useWidgetParams } from "./properties/useWidgetParams";
import { useWidgetProps } from "./properties/useWidgetProps";

export {
	OpenAiProvider,
	useCallTool,
	useDisplayMode,
	useLocale,
	useMaxHeight,
	useOpenAiGlobal,
	useOpenAiReady,
	useOpenExternal,
	useRequestDisplayMode,
	useRequestModal,
	useSafeArea,
	useSendFollowUpMessage,
	useTheme,
	useUserAgent,
	useWidgetMeta,
	useWidgetParams,
	useWidgetProps,
	useWidgetState,
};

export type {
	OpenAiProviderEmits,
	OpenAiProviderProps,
} from "./components/OpenAiProvider/types";
