<template>
  <div class="container">
    <Transition mode="out-in">
      <Suspense>
        <template #default>
          <ImageAsync :src="src" @mouseenter="mask = true" />
        </template>
        <template #fallback>
          <canvas class="skeleton" ref="skeletonRef" width="32" height="32"></canvas>
        </template>
      </Suspense>
    </Transition>
    <div class="mask" v-if="mask" @mouseleave="mask = false">
      <div class="meta">
          <h3>{{ title }}</h3>
          <p>
            <span v-if="location">
              <i class="fas fa-map-marker-alt"></i>
              {{ location }}
            </span>
            <span v-if="year">
              <i class="fas fa-clock"></i>
              {{ year }}
            </span>
          </p>
          <p>{{ description }}</p>
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
const mask = ref(false);

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

.container > img {
  width: 100%;
  display: block;
}

.skeleton {
  width: 100%;
  border-radius: 8px;
}

.mask {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: absolute;
  background: radial-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.5) 100%),
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
  margin-top: 8px;
  font-size: .5rem;
}

.meta p:nth-of-type(2) {
  overflow: hidden;
  font-size: .8rem;
}

.meta p:nth-of-type(2):not(:empty){
  margin-top: 8px;
}

.meta p:nth-of-type(2) {
  white-space: nowrap;
  text-overflow: ellipsis;
}

.meta p:nth-of-type(1) > span:nth-child(1) {
  margin-right: 12px;
}

.meta p:nth-of-type(1) > span > i {
  margin-right: 6px;
}
</style>
