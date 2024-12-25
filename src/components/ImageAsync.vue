<template>
  <img :src="srcBase64" v-if="srcBase64" />
</template>

<script setup>
import { ref, unref } from 'vue';
import { useIntervalFn } from '@vueuse/core';

const props = defineProps({
  src: String,
});
const srcBase64 = ref('');

function imgToBase64(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

  // Only `image/jpeg` and `image/png` are supported for the moment
  let format = 'image/jpeg';
  if (props.src.endsWith('.png')) {
    format = 'image/png';
  }
  return canvas.toDataURL(format);
}

// using another `img` element instead of directly fetching the `src`
// is in order to make sure only one request will be sent.
const img = new Image();
img.src = unref(props.src);
await new Promise((resolve) => {
  img.onload = () => {
    const { pause } = useIntervalFn(() => {
      if (img.complete) {
        // converts buffer to base64
        srcBase64.value = imgToBase64(img);

        // call it a day
        pause();
        resolve();
      }
    }, 50);
    resolve();
  };
});
</script>
