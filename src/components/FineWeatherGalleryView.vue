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
import ImageCard from './ImageCard.vue';
import ImageDetail from './ImageDetail.vue';

const IMAGE_URL_PREFIX = 'https://images.tkzt.cn/fine-weather/';
const images = ref([
  {
    src: `${IMAGE_URL_PREFIX}13.jpg`,
    blurHash: {
      encoded: 'UCIrKH4.x^E09H~X%KNF~XITRjxbxoM{kER%',
      size: [
        2450,
        2450,
      ],
    },
    title: '蔷薇与黄水仙',
    location: '江南大学，无锡',
    year: '2018',
    description: '用黄水仙来形容小娃，乍地似乎不太恰当。这一面的蔷薇是初春北区壮丽的风景，是极好的朋友圈素材，故每到花开，其下必然簇拥着许多男男女女。拍照片的时候，看见鹅黄的裙子一下就想到了黄水仙，倒也无可厚非。',
  },
  {
    src: `${IMAGE_URL_PREFIX}18.jpg`,
    blurHash: {
      encoded: 'U2C?o-~qyDsA-V%MEexaxu%Mt7M{S#IU=}R*',
      size: [
        4032,
        2268,
      ],
    },
    title: '失色',
    location: '泗泾，上海',
    year: '2018',
    description: '大三下上海实习的日子伴随一些忧郁情绪展开，一「失色」以概之。',
  },
  {
    src: `${IMAGE_URL_PREFIX}19.jpg`,
    blurHash: {
      encoded: 'UjE1N+Sxn,Nb0}nla{oJ$jWooLs:xYs:RkR+',
      size: [
        1920,
        1078,
      ],
    },
    title: 'Hello, SH',
    location: '泗泾，上海',
    year: '2018',
    description: '很长一段时间里，这张图片都被用作博客 “Hello World” 页面的配图，那时刚出校实习，坐在出租车上，耳机里播的是「这是你想要的生活吗」。',
  },
  {
    src: `${IMAGE_URL_PREFIX}20.jpg`,
    blurHash: {
      encoded: 'UYG8.Y?FIpI;~pxtNGRlW=a}WBf7IVR*ofs:',
      size: [
        3961,
        2227,
      ],
    },
    title: '雪后初晴',
    location: '宿迁',
    year: '2018',
    description: '老树、老房子、老猫以及许多老人已经都没了。那年的雪真的大啊。',
  },
  {
    src: `${IMAGE_URL_PREFIX}21.jpg`,
    title: '舔脚猫',
    location: '晓庄学院，南京',
    year: '2018',
    description: '这是一只南晓里的三花猫，一直躺地上做一些清洁工作。还有一只蹲在草里一直打哈欠的猫的照片，找不到了。',
    blurHash: {
      encoded: 'U6Kd*u4o0JIV4:RODhRiD#M|McS5RiRoRhWF',
      size: [
        1506,
        750,
      ],
    },
  },
  {
    src: `${IMAGE_URL_PREFIX}14.jpg`,
    title: '青天',
    location: '宿迁',
    year: '2019',
    description: '关于故乡天空的印象几乎都是这样的。',
    blurHash: {
      encoded: 'UADm^G%M03E2$+ofD*NGE3Rk-:xt0LRj_1%2',
      size: [
        2774,
        1280,
      ],
    },
  },
  {
    src: `${IMAGE_URL_PREFIX}17.jpg`,
    title: '惊雀',
    location: '宿迁',
    year: '2019',
    description: '麻雀&绵延的电线，这也是乡愁的一种具象。',
    blurHash: {
      encoded: 'UKMHoyaxNIxt_NRkM|oeE3aeRjWCaht6RjWV',
      size: [
        2895,
        1280,
      ],
    },
  },
  {
    src: `${IMAGE_URL_PREFIX}1.jpg`,
    blurHash: {
      encoded: 'UTCi:cIo00oIx]oLM{ay9Fs:-;WCRij]ozoL',
      size: [
        1776,
        1184,
      ],
    },
    title: '窗台上的雏菊',
    location: '无锡',
    year: '2020',
    description: '彼时刚开启无锡的一段胡闹经历，一切尚显明媚，和照片里的阳光一般。',
  },
  {
    src: `${IMAGE_URL_PREFIX}2.jpg`,
    blurHash: {
      encoded: 'USIY2ntSWAtR0LIUt6j]SjWCofof%LWBfPog',
      size: [
        1776,
        1184,
      ],
    },
    title: '鹅',
    location: '贡湖湾湿地公园，无锡',
    year: '2020',
    description: '',
  },
  {
    src: `${IMAGE_URL_PREFIX}3.jpg`,
    blurHash: {
      encoded: 'UQF}+R%M9GD%1Ot8V@M_}?ogs:adEOs.a{a#',
      size: [
        1776,
        1184,
      ],
    },
    title: '五环',
    location: '贡湖湾湿地公园，无锡',
    year: '2020',
    description: '',
  },
  {
    src: `${IMAGE_URL_PREFIX}4.jpg`,
    blurHash: {
      encoded: 'U7CGl6W8ID0P^TI.IWSvz~Xl-js+j5t8tM-l',
      size: [
        1776,
        1184,
      ],
    },
    title: '蝶',
    location: '贡湖湾湿地公园，无锡',
    year: '2020',
    description: '',
  },
  {
    src: `${IMAGE_URL_PREFIX}5.jpg`,
    blurHash: {
      encoded: 'USHx$wD%D%~qo#kCj]jsM|Rja#t7NGofbHof',
      size: [
        1776,
        1332,
      ],
    },
    title: '害羞猫',
    location: '江南大学，无锡',
    year: '2020',
    description: '蹲在地上，朝这只小猫招手，它起身又坐下，开始东张西望，不知是害羞还是有所顾虑，始终不肯过来。这和学校里其他流浪猫全然不同。',
  },
  {
    src: `${IMAGE_URL_PREFIX}7.jpg`,
    blurHash: {
      encoded: 'UCHKXs8|6vXn?];OIBo~J--ov#Nb-QTIRirG',
      size: [
        1620,
        1080,
      ],
    },
    title: '火棘',
    location: '无锡',
    year: '2020',
    description: '彼时已然秋末，万物枯衰，唯此物红艳，正所谓「犹见青枝含艳果」。',
  },
  {
    src: `${IMAGE_URL_PREFIX}8.jpg`,
    blurHash: {
      encoded: 'UAC?+5_3VyR$~q-=t7ocDoajt6xuIAR%WDt8',
      size: [
        1776,
        1184,
      ],
    },
    title: '绿林',
    location: '无锡',
    year: '2020',
    description: '',
  },
  {
    src: `${IMAGE_URL_PREFIX}10.jpg`,
    blurHash: {
      encoded: 'U6J9ln00%iOb9GS6i]VqxuWBRjkEV?aekDbc',
      size: [
        1776,
        1184,
      ],
    },
    title: '参天',
    location: '江南大学，无锡',
    year: '2020',
    description: '',
  },
  {
    src: `${IMAGE_URL_PREFIX}15.jpg`,
    title: '老树',
    location: '江南大学，无锡',
    year: '2020',
    description: '',
    blurHash: {
      encoded: 'UFHVScNH?wbxMzIAIAjF-;oextRiM}j[RORj',
      size: [
        1579,
        1184,
      ],
    },
  },
  {
    src: `${IMAGE_URL_PREFIX}11.jpg`,
    blurHash: {
      encoded: 'UEGS3@kWVr.8EYoyIn%N%LV[M{jYr:IVRjMw',
      size: [
        4032,
        3024,
      ],
    },
    title: '睡狗',
    location: '无锡',
    year: '2020',
    description: '绿油油的画面里，躺着几只相似的狗，这个场景像是 AI 生成的。',
  },
  {
    src: `${IMAGE_URL_PREFIX}6.jpg`,
    blurHash: {
      encoded: 'UADS?kAAN3~U%X~pouIX9twOkCpFDkoe-:Rj',
      size: [
        1776,
        1184,
      ],
    },
    title: '斑驳',
    location: '荣氏梅园，无锡',
    year: '2021',
    description: '',
  },
  {
    src: `${IMAGE_URL_PREFIX}9.jpg`,
    blurHash: {
      encoded: 'UGE:rtB?rqg3JbN|n3a_ITn4t8Vst.aeS5t8',
      size: [
        1776,
        1184,
      ],
    },
    title: '梅与蜂',
    location: '荣氏梅园，无锡',
    year: '2021',
    description: '',
  },
  {
    src: `${IMAGE_URL_PREFIX}12.jpg`,
    blurHash: {
      encoded: 'UPE3#,b}I7r;kYWAogjuW9oJV=WVbdoga|bJ',
      size: [
        1440,
        1080,
      ],
    },
    title: '粉色腊梅',
    location: '荣氏梅园，无锡',
    year: '2021',
    description: '彼时，在树下吃冰淇淋，味道完全没有印象，只记得化得飞快。',
  },
  {
    src: `${IMAGE_URL_PREFIX}16.jpg`,
    title: '盛开',
    location: '上海',
    year: '2022',
    description: '这是春日路边再普通不过的一丛月季，不普通之处在于这是 Lockdown 近三个月后，第一次出门时看见的，一整个春天被关在窗外。',
    blurHash: {
      encoded: 'UAFPA]4n9ZRQD6VuNGS2A9xttMkW%NE2sDnh',
      size: [
        1440,
        1080,
      ],
    },
  },
]);
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
  font-size: xx-small;
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
