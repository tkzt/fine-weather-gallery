<template>
  <main>
    <article>
      <div class="preface">
        <p>
          由于有若干个能拍照的设备，再加上时间会公平地杀死一切，我每年都会拍出几张回看时<strong>感慨万千</strong>的照片。
        </p>
        <p>
          但由于时间与地域的关系，这些照片往往要么丢失，要么被随意塞在网盘的某处。
          于是，现在 <em class="caption">(2022-11-28)</em> 我决心花一些精力把它们维护起来。
          然而，正如前面所言，原图已不易寻觅，目前所得的一些图片大多来自微信朋友圈或微博，很遗憾图片质量已损失太多。
        </p>
        <p>而这些图片拍时多是好天气，所以干脆统称这些照片为<strong>「一些晴朗的日子」</strong>。</p>
        <p>
          图片目前采用
          <strong>
            Github + <a target="_blank" class="link" href="https://vercel.com/">Vercel</a>
          </strong>
          来托管，感谢这个伟大的时代。
        </p>
      </div>
      <ImageCard class="cell" v-for="img, index in images" :key="index" v-bind="img"
        @click="openDetail(index)" />
    </article>
    <footer class="caption">
      &copy;
      <small>2022{{ 2022 === new Date().getFullYear() ? '' : ' - Present' }}&nbsp;Allen Tao</small>
      <span class="divider">-</span>
      <a href="https://github.com/boring-plans/fine-weather-gallery" class="link" target="_blank">
        <i class="fa fa-github"></i>
      </a>
    </footer>
    <ImageDetail v-model="imageDetailModel" v-bind="imageDetails"
      @lastImage="openDetail(imageDetails.current - 1)"
      @nextImage="openDetail(imageDetails.current + 1)" />
  </main>
</template>

<script setup>
import {
  nextTick, onMounted, reactive, ref, watchEffect,
} from 'vue';
import { useEventListener } from '@vueuse/core';
import imagesJson from '@/assets/images.json';
import ImageCard from './ImageCard.vue';
import ImageDetail from './ImageDetail.vue';

const images = ref(imagesJson);
const imageDetailModel = ref(false);
const imageDetails = reactive({
  imgMeta: {
    title: '',
    description: '',
    location: '',
    year: '',
    src: '',
    blurHash: {
      encoded: '',
      size: [],
    },
  },
  current: -1,
  total: images.value.length,
});

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

onMounted(() => {
  // calculate the scroll bar width
  const div = document.createElement('div');
  div.style.overflow = 'scroll';
  document.body.appendChild(div);

  nextTick(() => {
    document.documentElement.style.setProperty('--scrollbar-width', `${div.offsetWidth - div.clientWidth}px`);
    document.body.removeChild(div);
  });

  // register keypress event
  useEventListener(document, 'keydown', keypressListener);

  watchEffect(() => {
    if (imageDetailModel.value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  });
});

</script>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  width: calc(100vw - var(--scrollbar-width));
}

article {
  padding: 24px;
  column-count: 1;
  column-gap: 24px;
}

.caption {
  font-size: x-small;
  color: rgba(0, 0, 0, .27);
}

.link {
  color: #c4b5fd;
  text-decoration: none;
  transition: .2s ease-in-out;
}

.link:hover {
  color: #a78bfa;
}

.preface {
  display: flex;
  align-items: center;
  justify-content: start;
  flex-wrap: wrap;
  height: fit-content;
  padding: 12px 24px;
  margin-bottom: 24px;
  border-radius: 8px;
  break-inside: avoid;
  background-color: white;
  white-space: pre-line;
  position: relative;
  color: rgba(0, 0, 0, .78);
}

.preface h1 {
  margin-top: 0;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  letter-spacing: .75px;
}

.preface p {
  margin: 0;
  text-align: justify;
  letter-spacing: .5px;
  line-height: 1.5;
  font-size: 0.95rem;
}

.preface p:nth-last-child(n+2) {
  margin-bottom: 12px;
}

.cell {
  break-inside: avoid;
  margin-bottom: 24px;
}

footer {
  padding: 24px;
  padding-top: 0;
  text-align: center;
}

.divider {
  display: inline-block;
  margin: 0 1rem;
  transform: rotate(90deg);
}

@media screen and (min-width: 600px) {
  article {
    column-count: 2;
  }
}

@media screen and (min-width: 900px) {
  article {
    column-count: 3;
  }
}

@media screen and (min-width: 1400px) {
  article {
    column-count: 4;
  }
}

@media screen and (min-width: 1920px) {
  article {
    column-count: 5;
  }
}

@media (prefers-color-scheme: dark) {
  .preface {
    background-color: #343434;
    color: rgba(255, 255, 255, .78);
  }

  .caption {
    color: rgba(255, 255, 255, .27);
  }

  .link {
    color: #7c3aed;
  }

  .link:hover {
    color: #6d28d9;
  }
}
</style>
