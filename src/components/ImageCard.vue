<template>
  <div class="container">
    <Transition mode="out-in">
      <Suspense>
        <template #default>
          <ImageAsync :src="src" @mouseenter="cover = true" />
        </template>
        <template #fallback>
          <canvas class="skeleton" ref="skeletonRef" width="32" height="32"></canvas>
        </template>
      </Suspense>
    </Transition>
    <div class="cover" v-if="cover" @mouseleave="cover = false">
      <div class="meta">
        <h3>{{ title }}</h3>
        <p class="time-location">
          <span v-if="location"><i class="fas fa-map-marker-alt"></i>{{ location }}</span>
          <span v-if="year"><i class="fas fa-clock"></i>{{ year }}</span>
        </p>
        <p class="description">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { decode } from 'blurhash';
import ImageAsync from './ImageAsync.vue';

const props = defineProps({
  src: String,
  title: {
    type: String,
    default: '无题',
  },
  location: String,
  year: String,
  description: String,
  blurHash: {
    encoded: String,
    size: Array,
  },
});
const skeletonRef = ref(null);
const cover = ref(false);

onMounted(() => {
  const originSize = props.blurHash.size;
  skeletonRef.value.height = Math.floor((originSize[1] / originSize[0]) * 32);

  const pixels = decode(props.blurHash.encoded, 32, 32);
  const ctx = skeletonRef.value.getContext('2d');
  const imageData = ctx.createImageData(32, 32);
  imageData.data.set(pixels);
  ctx.putImageData(imageData, 0, 0);
});
</script>

<style scoped>
.container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  transition: .17s ease;
  cursor: pointer;
}

.container:hover {
  transform: scale(1.03);
}

.container>img {
  width: 100%;
  display: block;
}

@keyframes loading {
  to {
    background-position-x: -20%;
  }
}

.skeleton {
  width: 100%;
  border-radius: 8px;
}

.cover {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: absolute;
  background-image: radial-gradient(rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.5) 100%),
    radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);
  display: flex;
  padding: 12px;
  align-items: flex-end;
  justify-content: start;
}

.meta {
  color: white;
  overflow: hidden;
}

.meta h3,
.meta p {
  margin: 0;
}

.meta h3 {
  margin-bottom: 6px;
}

.meta p:nth-of-type(1) {
  margin-bottom: 6px;
  font-size: .5rem;
}

.meta p:nth-of-type(2) {
  margin: 0;
  overflow: hidden;
  font-size: .8rem;
}

.meta p:nth-last-child(1) {
  white-space: nowrap;
  text-overflow: ellipsis;
}

.time-location {
  margin: 24px 0;
}

.time-location>span:nth-child(1) {
  margin-right: 12px;
}

.time-location>span>i {
  margin-right: 6px;
}
</style>
