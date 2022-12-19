<template>
  <img :src="src" />
</template>

<script setup>
import { unref } from 'vue';

const props = defineProps({
  src: String,
});

// using another `img` element instead of directly fetching the `src`
// is in order to make sure only one request will be sent.
const img = new Image();
img.src = unref(props.src);
await new Promise((resolve) => {
  img.onload = () => {
    resolve();
  };
});
</script>
