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
          <span class="text-sm">由于有若干个能拍照的设备，再加上时间会公平地杀死一切，我每年都会拍出几张回看时感慨万千的照片。</span>
          <span class="text-sm">但由于时间与地域的关系，这些照片往往要么丢失，要么被随意塞在网盘的某处。</span>
          <span class="text-sm">于是，<span class="
            relative before:w-100% before:h-.2rem before:bg-violet-300
            before:content-[''] before:absolute before:bottom--.1rem
            dark:before:bg-violet-500
          " title="2022-11-28">现在</span>我决心花一些精力把它们维护起来。</span>
          <span class="text-sm">然而，正如前面所言，原图已不易寻觅，目前所得的一些图片大多来自微信朋友圈或微博，很遗憾图片质量已损失太多。</span>
          <span class="text-sm">而这些图片拍时多是好天气，所以干脆统称这些照片为<strong>「一些晴朗的日子」</strong>。</span>
        </template>
        <strong class="text-1rem" v-else>「一些晴朗的日子」</strong>
        <div class="
          backdrop-blur-2 saturate-120%
          bg-#4c1d9525
          pa-1 rd-50% mr-2 cursor-pointer
          hover:bg-#4c1d9545 active:bg-#4c1d9562
          dark:bg-violet-900 dark:c-gray-200 dark:hover:bg-violet-800 dark:active:bg-violet-700
        " :class="{
          'absolute bottom-.5rem right-.5rem': !folded
        }" @click="folded = !folded">
          <div class="text-xl" :class="folded ? 'i-mdi-chevron-down' : 'i-mdi-chevron-up'"></div>
        </div>
      </div>
      <ImageCard class="mb-4" v-for="img, index in images" :key="index" v-bind="img"
        @click="openDetail(index)" />
    </div>
    <div class="flex my-18 justify-center select-none text-xs">
      <div v-if="loadingImages" class="flex items-center">
        Loading
        <i class="
          i-mdi-loading animate-iteration-infinite block ml-2
          animate-spin c-gray-600 dark:c-gray-200
        " />
      </div>
      <div class="
        c-gray-600 dark:c-gray-200 cursor-pointer
        rd-2 py-1 px-2 hover:bg-#4c1d9525 active:bg-#4c1d9545
        dark:c-gray-200 dark:hover:bg-violet-900 dark:active:bg-violet-800
      " @click="currentPage += 1" v-else-if="hasMore">
        More
      </div>
      <div class="c-gray-600 dark:c-gray-200 py-1" v-else>
        No More :/
      </div>
    </div>
    <footer class="flex items-center justify-between">
      <div class="text-xl c-slate-800 flex items-center">
        <div class="
          backdrop-blur-2 saturate-120%
          bg-#4c1d9525 pa-1 rd-50% mr-2 cursor-pointer
          hover:bg-#4c1d9545 active:bg-#4c1d9562
          dark:bg-violet-900 dark:c-gray-200 dark:hover:bg-violet-800 dark:active:bg-violet-700
        " @click="isDark = !isDark">
          <div class="i-mdi-white-balance-sunny"></div>
        </div>
        <div class="
          backdrop-blur-2 saturate-120%
          bg-#4c1d9525 pa-1 rd-50% cursor-pointer
          hover:bg-#4c1d9545 active:bg-#4c1d9562
          dark:bg-violet-900 dark:c-gray-200 dark:hover:bg-violet-800 dark:active:bg-violet-700
        " @click="jumpTo('https://github.com/tkzt/fine-weather-gallery')">
          <div class="i-mdi-github"></div>
        </div>
      </div>

      <div class="text-xs c-gray-600 dark:c-gray-200">
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
import AV from 'leancloud-storage';
import ImageCard from './ImageCard.vue';
import ImageDetail from './ImageDetail.vue';

const PAGE_SIZE = 20;

const isDark = useDark();
const images = ref([]);
const imagesInfoMap = ref(null);
const imageDetailModel = ref(false);
const loadingImages = ref(false);
const folded = ref(false);
const hasMore = ref(true);
const currentPage = ref(0);
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

function jumpTo(url) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.click();
}

function openDetail(index) {
  imageDetails.current = index;
  imageDetails.imgMeta = images.value[index];
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

async function init() {
  // lc
  AV.init({
    appId: import.meta.env.VITE_LC_APP_ID,
    appKey: import.meta.env.VITE_LC_APP_KEY,
    serverURL: import.meta.env.VITE_LC_SERVER_URL,
  });

  // info map
  imagesInfoMap.value = await (await fetch(`${import.meta.env.VITE_IMG_FETCH_PREFIX + import.meta.env.VITE_IMG_NAME_PREFIX}images.json`, {
    method: 'GET',
    mode: 'cors',
  })).json();
}

async function loadImages(page = 0) {
  loadingImages.value = true;
  const query = new AV.Query('Image');
  query.limit(PAGE_SIZE).skip(page * PAGE_SIZE);

  const response = (await query.find());
  const appendImages = response.filter(
    (r) => images.value.every((i) => i.src !== r.attributes.name),
  ).map((r) => {
    const { attributes } = r;
    const info = imagesInfoMap.value[import.meta.env.VITE_IMG_NAME_PREFIX + attributes.name];

    return {
      ...attributes,
      src: attributes.name,
      blurHash: {
        size: info.size,
        encoded: info.hash,
      },
    };
  });

  images.value.push(...appendImages);
  imageDetails.total = images.value.length;
  loadingImages.value = false;

  return appendImages.length === PAGE_SIZE;
}

onMounted(async () => {
  await init();

  // register keypress event
  useEventListener(document, 'keydown', keypressListener);
});

watchEffect(async () => {
  if (imagesInfoMap.value && hasMore.value) {
    hasMore.value = await loadImages(currentPage.value);
  }
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
.dots {
  background: url("data:image/svg+xml;utf8, <svg width='16' height='16' fill='none' xmlns='http://www.w3.org/2000/svg'><rect fill='rgba(25, 33, 38, 0.2)' x='7' y='7' width='2' height='2'></rect></svg>") fixed;
}

.dots.dark {
  background: url("data:image/svg+xml;utf8, <svg width='16' height='16' fill='none' xmlns='http://www.w3.org/2000/svg'><rect fill='rgba(255, 255, 255, 0.17)' x='7' y='7' width='2' height='2'></rect></svg>") fixed;
}
</style>
