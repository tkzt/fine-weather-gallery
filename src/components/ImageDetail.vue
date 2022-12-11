<template>
  <div class="detail-container" v-if="modelValue">
    <div class="img-area">
      <button class="btn close-btn" @click="emits('update:modelValue', false)">
        <i class="fas fa-times"></i>
      </button>

      <button class="btn toggle-meta-btn" @click="(folded = !folded)" v-if="(windowWidth > 900)">
        <i class="fas" :class="[folded ? 'fa-angle-double-left' : 'fa-angle-double-right']"></i>
      </button>
      <button class="btn toggle-meta-btn-md" @click="(folded = !folded)" v-else>
        <i class="fas" :class="[folded ? 'fa-angle-double-up' : 'fa-angle-double-down']"></i>
      </button>

      <button class="btn last-btn" @click="emits('lastImage')" v-show="(current > 0)">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button class="btn next-btn" @click="emits('nextImage')" v-show="(current < total - 1)">
        <i class="fas fa-chevron-right"></i>
      </button>

      <div class="img-container">
        <img :src="imgMeta.src" />
      </div>
    </div>
    <Transition :enter-active-class="metaEnterActiveClass"
      :leave-active-class="metaLeaveActiveClass">
      <div class="meta" v-if="!folded">
        <h1>{{ imgMeta.title || '无题' }}</h1>
        <div class="time-location">
          <span class=""><i class="fas fa-map-marker-alt"></i>{{ imgMeta.location }}</span>
          <span><i class="fas fa-clock"></i>{{ imgMeta.year }}</span>
        </div>
        <div class="description">
          {{ imgMeta.description || '无描述 :/' }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useWindowSize } from '@vueuse/core';
import 'animate.css';

defineProps({
  imgMeta: {
    title: String,
    location: String,
    year: String,
    description: String,
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
const { width: windowWidth } = useWindowSize();
const metaEnterActiveClass = ref('');
const metaLeaveActiveClass = ref('');

watch(() => windowWidth.value, (val) => {
  if (val > 900) {
    metaEnterActiveClass.value = 'animate__animated animate__slideInRight';
    metaLeaveActiveClass.value = 'animate__animated animate__slideOutRight';
  } else {
    metaEnterActiveClass.value = 'animate__animated animate__slideInUp';
    metaLeaveActiveClass.value = 'animate__animated animate__slideOutDown';
  }
});

const folded = ref(false);

onMounted(() => {
  if (windowWidth.value > 900) {
    metaEnterActiveClass.value = 'animate__animated animate__slideInRight';
    metaLeaveActiveClass.value = 'animate__animated animate__slideOutRight';
  } else {
    metaEnterActiveClass.value = 'animate__animated animate__slideInUp';
    metaLeaveActiveClass.value = 'animate__animated animate__slideOutDown';
  }
});
</script>

<style scoped>
.detail-container {
  height: 100vh;
  width: 100vw;
  position: fixed;
  background: rgba(47, 14, 59, 0.62);
  backdrop-filter: saturate(180%) blur(40px);
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0;
  outline: none;
  background-color: transparent;
  border: none;
  border-radius: 50%;
  height: 40px;
  width: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: large;
  transition: .1s ease-in-out;
  color: rgba(255, 255, 255, .85);
  background-color: rgba(145, 116, 155, 0.6);
  backdrop-filter: saturate(180%) blur(20px);
}

.btn:hover {
  background-color: rgba(145, 116, 155, 0.8);
}

.btn:active {
  background-color: rgba(145, 116, 155, 1);
}

.close-btn {
  position: absolute;
  top: 12px;
  left: 12px;
}

.toggle-meta-btn {
  position: absolute;
  top: 12px;
  right: 12px;
}

.toggle-meta-btn-md {
  position: absolute;
  left: 12px;
  bottom: 12px;
}

.last-btn {
  position: absolute;
  top: 50%;
  left: 12px;
  transform: translateY(-50%);
}

.next-btn {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
}

.img-area {
  display: flex;
  justify-content: center;
  position: relative;
  flex-grow: 1;
  overflow: hidden;
}

.img-container {
  height: 100%;
  width: 100%;
}

.img-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.meta {
  box-sizing: border-box;
  animation-duration: .17s;
  flex-shrink: 0;
  box-sizing: border-box;
  width: 30%;
  background-color: rgba(255, 255, 255, .6);
  padding: 24px 32px;
  backdrop-filter: saturate(200%) blur(40px);
  color: rgba(0, 0, 0, .85);
}

.meta h1 {
  margin-top: 0;
}

.time-location {
  margin: 24px 0;
}

.time-location>span:nth-child(1) {
  margin-right: 24px;
}

.time-location>span>i {
  margin-right: 8px;
}

.description {
  text-align: justify;
  letter-spacing: 0.06rem;
  line-height: 1.5;
  font-size: 1.5rem;
}

@media (prefers-color-scheme: dark) {
  .meta {
    background-color: rgba(0, 0, 0, .6);
    color: rgba(255, 255, 255, .85);
  }
}

@media screen and (max-width: 900px) {
  .detail-container {
    flex-direction: column;
  }

  .meta {
    width: 100%;
    height: fit-content;
    padding: 16px 18px;
  }

  .meta h1 {
    font-size: larger;
  }

  .description {
    font-size: medium;
    white-space: pre-line;
    word-break: break-all;
  }

  .time-location {
    font-size: smaller;
    margin: 16px 0;
  }

  .btn {
    width: 32px;
    height: 32px;
  }
}
</style>
