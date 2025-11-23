<script lang="ts" setup>
import '../types'
import { onMounted, ref } from 'vue';

const ready = ref(false);
const error = ref<string | null>(null);
let running = false;

const TIMEOUT_MS = 15000;

function openAiIsAvailable() {
  const globalObject = window.openaix;
  return !!(globalObject && typeof globalObject.callTool === 'function');
}

function waitForOpenAi(): Promise<void> {
  return new Promise((resolve, reject) => {
    const requestDuration = performance.now();

    const requestOpenAi = () => {
      if (openAiIsAvailable()) return resolve();

      if (performance.now() - requestDuration > TIMEOUT_MS)
        return reject(new Error('OpenAI SDK timeout'));

      requestAnimationFrame(requestOpenAi);
    }

    requestAnimationFrame(requestOpenAi);
  });
}

async function startOpenAiRequest() {
  if (running) return;

  running = true;
  error.value = null;
  ready.value = false;

  try {
    await waitForOpenAi();
    ready.value = true;
  } catch (err) {
    error.value = err instanceof Error
      ? err.message
      : 'Unknown error';
  } finally {
    running = false;
  }
}

onMounted(startOpenAiRequest);
</script>

<template>
  <template v-if="error">
    <slot name="error" :message="error" :retry="startOpenAiRequest">
      <div>
        <p>{{ error }}</p>
        <button @click="startOpenAiRequest">Retry</button>
      </div>
    </slot>
  </template>

  <template v-else-if="ready">
    <slot />
  </template>

  <template v-else>
    <slot name="loading">
      <p>Loading ChatGPT App Bridge…</p>
    </slot>
  </template>
</template>
