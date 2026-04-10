<p align="center">
    <img src="public/fine-weather-gallery.ico" />
    <br />
    <h1 align="center">一些晴朗的日子</h1>
</p>

由于有若干个能拍照的设备，再加上时间会公平地杀死一切，我每年都会拍出几张回看时**感慨万千**的照片。

但由于时间与地域的关系，这些照片往往要么丢失，要么被随意塞在网盘的某处。于是，现在 _（2022-11-28）_ 我决心花一些精力把它们维护起来。然而，正如前面所言，原图已不易寻觅，目前所得的一些图片大多来自微信朋友圈或微博，很遗憾图片质量已损失太多。

而这些图片拍时多是好天气，所以干脆统称这些照片为 **「一些晴朗的日子」**。
    
图片目前采用 **GitHub + <a target="_blank" class="link" href="https://vercel.com/">Vercel</a>** 来托管，感谢这个伟大的时代。

## Getting Started

1. `pnpm i` & `pnpm prepare`
2. 添加照片到 `public/` 目录下
3. 修改 `src/assets/images.json` 文件，添加照片的基础信息，比如：
    ```json
    {
        "title": "公共艺术一",
        "desc": "",
        "location": "泗阳，江苏",
        "src": "ggys1.jpg",
        "year": "2024"
    }
    ```
4. 提交改动，触发 `husky` pre-commit，生成缩略图及 `blurhash`
5. 推送改动，触发 `GitHub Pages` 自动部署
