/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { presetUno, presetIcons, transformerVariantGroup } from 'unocss';
import { resolve } from 'path';
import transformerDirectives from '@unocss/transformer-directives';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCSS({
    presets: [presetIcons(), presetUno()],
    transformers: [transformerDirectives(), transformerVariantGroup()],
  })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // build: { exclude: /\/src\/assets\/.*\.md$/ },
});
