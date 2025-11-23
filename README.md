# Open AI Apps SDK for Vue

- A set of composables for Vue to assist with using the OpenAI SDK window object.
- A `<OpenAiProvider />` component that wraps your app code and provides the `window.openai` object

```ts
// Example usage
import { useRequestDisplayMode } from "@zacksmash/vue-open-ai-apps";

const requestDisplayMode = useRequestDisplayMode();

const onRequestDisplayMode = async () => {
    await requestDisplayMode("fullscreen");
};
``

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
