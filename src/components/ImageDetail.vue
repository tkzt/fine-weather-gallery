<template>
  <div class="
    h-100vh w-100vw fixed bg-[rgba(47,14,59,0.62)] flex justify-end top-0 left-0
    backdrop-blur-40 saturate-120
  " :class="{ 'flex-col': windowWidth < 1024 }" v-if="modelValue" :key="imgMeta.src">
    <div class="flex justify-center relative grow-1 overflow-hidden">
      <div class="btn absolute left-4 top-4" @click="emits('update:modelValue', false)">
        <i class="i-mdi-close"></i>
      </div>

      <div class="btn absolute right-4 top-4" @click="(folded = !folded)"
        v-if="(windowWidth > 1024)">
        <i :class="[folded ? 'i-mdi-chevron-double-left' : 'i-mdi-chevron-double-right']"></i>
      </div>
      <div class="btn absolute left-4 bottom-4" @click="(folded = !folded)" v-else>
        <i :class="[folded ? 'i-mdi-chevron-double-up' : 'i-mdi-chevron-double-down']"></i>
      </div>

      <div class="btn absolute left-4 top-50% translate-y--50%" @click="emits('lastImage')"
        v-show="(current > 0)">
        <i class="i-mdi-chevron-left"></i>
      </div>
      <div class="btn absolute right-4 top-50% translate-y--50%" @click="emits('nextImage')"
        v-show="(current < total - 1)">
        <i class="i-mdi-chevron-right"></i>
      </div>

      <div class="h-100% w-100%">
        <Suspense>
          <template #default>
            <ImageAsync :src="imgSrc" class="w-100% h-100% block object-contain" />
          </template>
          <template #fallback>
            <div class="reactive h-100% w-100%">
              <canvas class="w-100% h-100% block object-contain" ref="skeletonRef" width="32"
                height="32">
              </canvas>
              <div class='
                h-.75 w-6.2rem overflow-hidden absolute top-50% left-50%
                translate-x--50% translate-y--50%
              '>
                <div class='progress w-full h-full bg-[rgba(255,255,255,0.3)] left-right'></div>
              </div>
            </div>
          </template>
        </Suspense>
      </div>
    </div>

    <Transition :enter-active-class="metaEnterActiveClass"
      :leave-active-class="metaLeaveActiveClass">
      <div class="
        box-border shrink-0 lg:w-30% pa-8 backdrop-blur-40 saturate-200
        bg-[rgba(255,255,255,.6)] c-[rgba(0,0,0,.85)] important-animate-duration-170
      " v-if="!folded">
        <div class="fw-bold text-3xl lg:text-4xl">{{ imgMeta.title || '无题' }}</div>
        <div class="mt-6 flex lg:text-lg">
          <span class="mr-6 flex items-center">
            <i class="i-mdi-map-marker inline-block mr-1"></i>
            {{ imgMeta.location }}
          </span>
          <span class="flex items-center">
            <i class="i-mdi-clock inline-block  mr-1"></i>
            {{ imgMeta.year }}
          </span>
        </div>
        <div class="text-justify tracking-.05rem lh-150% lg:text-lg mt-4">
          {{ imgMeta.desc || '无描述 :/' }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { decode } from 'blurhash';
import {
  computed, ref, watchEffect,
} from 'vue';
import { useWindowSize } from '@vueuse/core';
import ImageAsync from './ImageAsync.vue';

const props = defineProps({
  imgMeta: {
    src: String,
    title: String,
    location: String,
    year: String,
    desc: String,
    blurHash: {
      encoded: String,
      size: Array,
    },
  },
  current: Number,
  total: Number,
  modelValue: Boolean,
});
const emits = defineEmits(['lastImage', 'nextImage', 'update:modelValue']);
const metaEnterActiveClass = ref('');
const metaLeaveActiveClass = ref('');
const skeletonRef = ref(null);

const { width: windowWidth } = useWindowSize();
const imgSrc = computed(
  () => props.imgMeta.src,
);

watchEffect(() => {
  if (props.modelValue && skeletonRef.value) {
    const originSize = props.imgMeta.blurHash.size;
    if (originSize[0] >= originSize[1]) {
      skeletonRef.value.height = Math.floor((originSize[1] / originSize[0]) * 32);
    } else {
      skeletonRef.value.width = Math.floor((originSize[0] / originSize[1]) * 32);
    }
    const pixels = decode(props.imgMeta.blurHash.encoded, 32, 32);
    const ctx = skeletonRef.value.getContext('2d');
    const imageData = ctx.createImageData(32, 32);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);
  }
});

watchEffect(() => {
  if (windowWidth.value > 1024) {
    metaEnterActiveClass.value = 'animate__animated animate__slideInRight';
    metaLeaveActiveClass.value = 'animate__animated animate__slideOutRight';
  } else {
    metaEnterActiveClass.value = 'animate__animated animate__slideInUp';
    metaLeaveActiveClass.value = 'animate__animated animate__slideOutDown';
  }
});

const folded = ref(false);
</script>

<style scoped>
@import url('animate.css');

.btn {
  --at-apply: pa-2 rd-50% cursor-pointer backdrop-blur-20 saturate-180 lg:pa-3;
  --at-apply: "c-[rgba(255,255,255,.85)] bg-[rgba(145,116,155,.6)]";
  --at-apply: "hover:bg-[rgba(145,116,155,.8)] active:bg-[rgba(145,116,155,1)]";
}

.btn i {
  --at-apply: block text-xl;
}

.progress {
  transform: translateX(-100%);
  animation: progress .8s -.1s ease-in-out infinite;
}

.left-right {
  transform-origin: 0% 50%;
}

@keyframes progress {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>
