# Open AI Apps SDK for Vue

A set of composables for Vue to assist with using the OpenAI SDK window object.

```ts
// Example usage
import { useRequestDisplayMode } from "@zacksmash/vue-open-ai-apps";

const requestDisplayMode = useRequestDisplayMode();

const onRequestDisplayMode = async () => {
    await requestDisplayMode("fullscreen");
};
``
