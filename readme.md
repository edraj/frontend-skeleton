## Skeleton web app (frontend) for DMART



### Installation

The Frontend requires a proper setup of DMART server. 

Currently the code is confirgured to use https://api.dmart.cc
(The configuration option `backend` can be found under src/config.ts)

```bash

git clone https://github.com/edraj/frontend-skeleton.git
cd frontend-skeleton
yarn install


# To run in dev mode : 
yarn dev

# To run in file-server mode (i.e. without Nodejs):
yarn build
caddy run

```

