<script lang="ts" setup>
import "../types";
import { watch } from "vue";
import { useOpenAiReady } from "../methods/useOpenAiReady";
import {
	type OpenAiProviderEmits,
	openAiProviderProps,
} from "./OpenAiProvider.types";

const props = defineProps(openAiProviderProps);

const emit = defineEmits<OpenAiProviderEmits>();

const bridge = useOpenAiReady({
	timeout: props.timeout,
	windowObject: props.windowObject,
	pollingInterval: props.pollingInterval,
	autoStart: props.autoStart,
});

const startOpenAiRequest = () => bridge.start();

watch(() => bridge.isLoading.value, (isLoading) => {
		if (isLoading) {
			emit("loading", { retry: startOpenAiRequest });
		}
	},
	{ immediate: true },
);

watch(() => bridge.ready.value, (isReady) => {
		if (isReady) {
			emit("ready", { duration: bridge.lastDuration.value ?? 0 });
		}
	},
	{ immediate: true },
);

watch(() => bridge.errorMessage.value, (message) => {
		if (message) {
			emit("error", {
				message,
				retry: startOpenAiRequest,
				cause: bridge.lastError.value ?? undefined,
			});
		}
	},
	{ immediate: true },
);

defineExpose({
	ready: bridge.ready,
	error: bridge.errorMessage,
	isLoading: bridge.isLoading,
	retry: startOpenAiRequest,
});
</script>

<template>
  <template v-if="bridge.errorMessage.value">
    <slot
      name="error"
      :message="bridge.errorMessage.value"
      :retry="startOpenAiRequest"
    >
      <div
        class="openai-provider__error"
        role="alert"
        aria-live="assertive"
        :class="props.errorClass"
      >
        <p class="openai-provider__error-text">
          {{ bridge.errorMessage.value ?? props.errorText ?? 'OpenAI SDK failed to initialize' }}
        </p>
        <button
          type="button"
          class="openai-provider__retry"
          @click="startOpenAiRequest"
        >{{ props.retryLabel ?? 'Retry' }}</button>
      </div>
    </slot>
  </template>

  <template v-else-if="bridge.ready.value">
    <slot />
  </template>

  <template v-else>
    <slot name="loading">
      <p
        class="openai-provider__loading"
        role="status"
        aria-live="polite"
        :class="props.loadingClass"
      >{{ props.loadingText ?? 'Loading ChatGPT App Bridge…' }}</p>
    </slot>
  </template>
</template>

<style scoped>
.openai-provider__loading,
.openai-provider__error {
	font: inherit;
	text-align: center;
	padding: var(--openai-provider-padding, 1rem);
	border-radius: var(--openai-provider-radius, 0.75rem);
}

.openai-provider__loading {
	color: var(--openai-provider-loading-color, #4b5563);
	background-color: var(--openai-provider-loading-bg, rgba(107, 114, 128, 0.1));
}

.openai-provider__error {
	color: var(--openai-provider-error-color, #991b1b);
	background-color: var(--openai-provider-error-bg, rgba(220, 38, 38, 0.08));
}

.openai-provider__error-text {
	margin: 0;
	font-weight: 600;
}

.openai-provider__retry {
	margin-top: 0.75rem;
	color: var(--openai-provider-retry-color, inherit);
	background: none;
	border: 1px solid currentColor;
	padding: 0.4rem 0.8rem;
	border-radius: var(--openai-provider-retry-radius, 999px);
	cursor: pointer;
}

.openai-provider__retry:focus-visible {
	outline: 2px solid currentColor;
	outline-offset: 2px;
}
</style>
