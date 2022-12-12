<template>
  <img :src="src" />
</template>

<script setup>
const props = defineProps({
  src: String,
});

// to make sure each image will be loaded just once
const img = new Image();
// eslint-disable-next-line vue/no-setup-props-destructure
img.src = props.src;
await new Promise((resolve) => {
  img.onload = () => {
    resolve();
  };
});
</script>
