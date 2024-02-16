<template>
  <main class="pa-4 dark:bg-#131130">
    <div class="h-100vh w-100vw dots fixed pointer-events-none" :class="{ 'dark': isDark }"></div>
    <div class="
      columns-1 sm:columns-2 md:columns-3 xl:columns-4 2xl:columns-5
      gap-x-4
    ">
      <div class="
        bg-#4c1d9525 backdrop-blur-2 saturate-120%
        dark:bg-violet-950 dark:c-gray-200 break-inside-avoid
        rd-2 pa-4 box-border mb-4 c-slate-800 text-justify lh-6 tracking-.5 text-0px
      " :class="{ 'flex items-center justify-between': folded }">
        <template v-if="!folded">
          <div class="text-sm">{{ INTRO }}</div>
        </template>
        <strong class="text-1rem" v-else>{{ TITLE }}</strong>
        <div class="
          backdrop-blur-2 saturate-120% bg-#4c1d9525 pa-1 rd-50% cursor-pointer
          hover:bg-#4c1d9545 active:bg-#4c1d9562
          dark:bg-violet-900 dark:c-gray-200 dark:hover:bg-violet-800 dark:active:bg-violet-700
        " :class="{
          'absolute bottom-2 right-2': !folded
        }" @click="folded = !folded">
          <div class="text-xl" :class="folded ? 'i-mdi-chevron-down' : 'i-mdi-chevron-up'"></div>
        </div>
      </div>
      <ImageCard class="mb-4" v-for="img, index in images" :key="index" v-bind="img"
        @click="openDetail(index)" />
    </div>
    <div class="flex my-18 items-center flex-col select-none text-xs">
      <div v-if="isReady">
        <emoji-reaction :reactor="reactor" :react="react" :unreact="unreact"
          :getReactions="getReactions" :dark="isDark" />
      </div>
      <div class="text-gray-400 mb-3 mt-2.5">
        {{ images.length }}<span class="mx-.5">/</span>{{ imagesEntire.length }}
      </div>
      <div v-if="loadingImages" class="flex items-center">
        <i class="
          i-mdi-loading animate-iteration-infinite block
          animate-spin c-gray-600 dark:c-gray-200
        " />
      </div>
      <div class="
        c-gray-600 dark:c-gray-200 cursor-pointer
        rd-2 py-1 px-2 simple-btn
      " @click="loadMore" v-else-if="imagesEntire.length > loaded">
        More
      </div>
      <div class="c-gray-600 dark:c-gray-200 py-1" v-else>
        No More
      </div>
    </div>
    <footer class="flex flex-col items-center">
      <div class="text-xl c-slate-800 flex items-center">
        <div class="
          backdrop-blur-2 saturate-120%
          pa-1 rd-50% mr-2 cursor-pointer
          simple-btn
        " @click="isDark = !isDark">
          <div class="i-mdi-white-balance-sunny"></div>
        </div>
        <div class="
          backdrop-blur-2 saturate-120%
          pa-1 rd-50% cursor-pointer
          simple-btn
        " @click="jumpTo('https://github.com/tkzt/fine-weather-gallery')">
          <div class="i-mdi-github"></div>
        </div>
      </div>

      <div class="text-xs c-gray-600 dark:c-gray-200 mt-3">
        <div class="text-center">
          <span>&copy; {{ new Date().getFullYear() }}</span>
          <span class="
            ml-2 inline-flex c-gray-600 items-center cursor-pointer b-1 b-solid b-transparent
            hover:b-b-gray-600
            dark:c-gray-200 dark:hover:b-b-gray-200
          " @click="jumpTo('https://tkzt.cn')">
            <span>Allen Tao</span>
            <i class="i-mdi-open-in-new ml-1"></i>
          </span>
        </div>
        <div class="text-gray-400 mt-1">Last updated at {{
          imagesEntire.at(-1)?.updateAt || new Date().toLocaleString() }}
        </div>
      </div>
    </footer>
    <ImageDetail v-model="imageDetailModel" v-bind="imageDetails"
      @lastImage="openDetail(imageDetails.current - 1)"
      @nextImage="openDetail(imageDetails.current + 1)" />
    <div class="
      fixed h-100vh w-100vw flex items-center justify-center top-0 left-0
      bg-[rgba(47,14,59,0.62)] backdrop-blur-20 saturate-120
    " v-if="!images.length">
      <i class="
        i-mdi-loading animate-iteration-infinite c-white block
        text-3xl lg:text-4xl animate-spin
      " />
    </div>
  </main>
</template>

<script setup>
import {
  onMounted, reactive, ref, watchEffect,
} from 'vue';
import { useDark, useEventListener } from '@vueuse/core';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { createClient } from '@supabase/supabase-js';
import { EmojiReaction } from 'emoji-reaction';
import ImageCard from './ImageCard.vue';
import ImageDetail from './ImageDetail.vue';
import imagesEntire from '../assets/images.json';

const PAGE_SIZE = 20;
const TITLE = '「一些晴朗的日子」';
const INTRO = `由于有若干个能拍照的设备，再加上时间会公平地杀死一切，我每年都会拍出几张回看时感慨万千的照片。但由于时间与地域的关系，这些照片往往要么丢失，要么被随意塞在网盘的某处。于是，现在（2022-11-28）我决心花一些精力把它们维护起来。然而，正如前面所言，原图已不易寻觅，目前所得的一些图片大多来自微信朋友圈或微博，很遗憾图片质量已损失太多。而这些图片拍时多是好天气，所以干脆统称这些照片为${TITLE}。`;

const SUPABASE_URL = 'https://cn1k1ka5g6h58d3qort0.baseapi.memfiredb.com';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImV4cCI6MzI4NDA5NDkyOSwiaWF0IjoxNzA3Mjk0OTI5LCJpc3MiOiJzdXBhYmFzZSJ9.J3LRysizveBsrp5O5epNlgkMeMOwpvdi7RLB6Yfowpg';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const isDark = useDark();
const imageDetailModel = ref(false);
const loadingImages = ref(false);
const folded = ref(false);
const reactor = ref('');
const isReady = ref(false);
const loaded = ref(0);
const imageDetails = reactive({
  imgMeta: {
    title: '',
    desc: '',
    location: '',
    year: '',
    src: '',
    blurHash: {
      encoded: '',
      size: [],
    },
  },
  current: -1,
  total: 0,
});
const images = ref([]);

const fpPromise = FingerprintJS.load();
(async () => {
  const fp = await fpPromise;
  const result = await fp.get();
  reactor.value = result.visitorId;
})();

async function react(reaction) {
  await supabase
    .from('fine-weather')
    .insert([
      { reactor: reactor.value, reaction },
    ]);
}

async function unreact(reaction) {
  await supabase
    .from('fine-weather')
    .delete()
    .eq('reactor', reactor.value)
    .eq('reaction', reaction);
}

async function getReactions() {
  const { data } = await supabase.from('fine-weather').select('reactor, reaction');
  return data?.reduce((pre, curr) => {
    const indexExists = pre.findIndex((p) => p.reaction === curr.reaction);
    if (indexExists > -1) {
      if (!pre[indexExists].reactors.includes(curr.reactor)) {
        pre[indexExists].reactors.push(curr.reactor);
      }
    } else {
      pre.push({
        reaction: curr.reaction,
        reactors: [curr.reactor],
      });
    }
    return pre;
  }, []);
}

function jumpTo(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.click();
}

function openDetail(index) {
  imageDetails.imgMeta = images.value[index];
  imageDetails.current = index;
  imageDetails.total = images.value.length;
  imageDetailModel.value = true;
}

function keypressListener(ev) {
  if (imageDetailModel.value) {
    if (ev.key === 'Escape') {
      imageDetailModel.value = false;
    } else if (ev.key === 'ArrowLeft' && imageDetails.current > 0) {
      openDetail(imageDetails.current - 1);
    } else if (ev.key === 'ArrowRight' && imageDetails.current < imageDetails.total - 1) {
      openDetail(imageDetails.current + 1);
    }
  }
}

function loadMore() {
  const delta = imagesEntire.slice(loaded.value, loaded.value + PAGE_SIZE);
  images.value.push(...delta);
  loaded.value += delta.length;
}

onMounted(() => {
  useEventListener(document, 'keydown', keypressListener);
  loadMore();
  isReady.value = true;
});

watchEffect(() => {
  if (imageDetailModel.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
});
</script>

<style scoped>
.simple-btn {
  --at-apply: hover:bg-#4c1d9545 active:bg-#4c1d9562 bg-#4c1d9525;
  --at-apply: dark:bg-violet-900 dark:c-gray-200 dark:hover:bg-violet-800 dark:active:bg-violet-700;
}

.dots {
  background: url("data:image/svg+xml;utf8, <svg width='16' height='16' fill='none' xmlns='http://www.w3.org/2000/svg'><rect fill='rgba(25, 33, 38, 0.2)' x='7' y='7' width='2' height='2'></rect></svg>") fixed;
}

.dots.dark {
  background: url("data:image/svg+xml;utf8, <svg width='16' height='16' fill='none' xmlns='http://www.w3.org/2000/svg'><rect fill='rgba(255, 255, 255, 0.17)' x='7' y='7' width='2' height='2'></rect></svg>") fixed;
}
</style>
