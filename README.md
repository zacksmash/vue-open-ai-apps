# Open AI Apps SDK for Vue

## Installation
```bash
npm i @zacksmash/vue-open-ai-apps
```

## Composables
A set of composables and UI helpers for Vue to assist with using the OpenAI SDK window object.
```ts
// Example usage
import { useRequestDisplayMode } from "@zacksmash/vue-open-ai-apps";

const requestDisplayMode = useRequestDisplayMode();

const onRequestDisplayMode = async () => {
    await requestDisplayMode("fullscreen");
};
```

## `<OpenAiProvider />`

The provider waits for the host page to inject `window.openai`, exposes typed lifecycle events (`ready`, `loading`, `error`), and renders accessible defaults that can be overridden via slots or CSS variables.
```vue
<script setup>
import { OpenAiProvider } from '@zacksmash/vue-open-ai-apps'
</script>

<template>
    <template #loading>
        <!-- loading the app -->
    </template>

    <!-- Default slot for your root app component -->
    <App />

    <template #error="{ message, retry }">
        <!-- App was not loaded, retry or show error message -->
    </template>
</template>
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `timeout` | `number` | `15000` | How long (ms) to wait before emitting an error event. |
| `windowObject` | `string` | `"openai"` | Global key to probe for the OpenAI bridge (useful for testing). |
| `autoStart` | `boolean` | `true` | Automatically begin polling when the component mounts. |
| `pollingInterval` | `number?` | `requestAnimationFrame` | Fixed interval in ms for environments without RAF. |
| `loadingText` / `errorText` / `retryLabel` | `string?` | Built-in copy | Override the default i18n-friendly strings without replacing slots. |
| `loadingClass` / `errorClass` | `string?` | `undefined` | Apply custom classes while still using default markup. |

> The runtime prop config lives in `components/OpenAiProvider.types.ts`, so the package always ships accurate TypeScript definitions.

### Events

```vue
<OpenAiProvider
    @loading="({ retry }) => console.log('loading', retry)"
    @ready="({ duration }) => console.log('ready in', duration)"
    @error="({ message }) => toast.error(message)"
/>
```

- `loading`: fires whenever a connection attempt is in flight; useful for analytics or global progress indicators.
- `ready`: dispatched once the host bridge resolves; includes the measured duration in milliseconds.
- `error`: emitted for timeouts or unexpected failures, with a retry handler and original `cause` when available.

### Slots & Styling

| Slot | Purpose |
| --- | --- |
| `default` | Render your app shell once the bridge is ready. |
| `loading` | Replace the default status message. Receive no scoped props. |
| `error` | Override the error UI. Receives `{ message, retry }`. |

Accessible defaults automatically announce changes with `role="status"` / `role="alert"`. You can further style them through CSS variables:

```css
:root {
	--openai-provider-loading-color: #1d4ed8;
	--openai-provider-error-bg: #fee2e2;
}
```

## `useOpenAiReady()`

If you only need the readiness logic without UI, import the composable:

```ts
import { useOpenAiReady } from "@zacksmash/vue-open-ai-apps";

const bridge = useOpenAiReady({ timeout: 10_000, autoStart: false });
await bridge.start();

if (bridge.ready.value) {
	// safe to interact with window.openai
}
```

The composable mirrors the provider props (`timeout`, `autoStart`, `pollingInterval`, `windowObject`) and returns reactive refs for `ready`, `errorMessage`, `isLoading`, `lastError`, `lastDuration`, plus `start()` / `reset()` helpers.
