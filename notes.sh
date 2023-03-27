#!/bin/bash

 npx @roxi/routify@next create frontend-skeleton
 cd frontend-skelton
 yarn install
 yarn build
 yarn dev

yarn add -D typescript
yarn add -D svelte-preprocess


yarn add -D bootstrap bootstrap-icons sveltestrap @popperjs/core@^2.11.0

yarn add -D svelte-i18n
yarn add -D axios
yarn add -D @zerodevx/svelte-toast
