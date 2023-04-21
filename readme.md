## Skeleton web app (frontend) for DMART



### Installation

The Frontend requires a proper setup of DMART server. 

Currently the codie is confirgured to use https://api.dmart.cc
(The configuration option `backend` can be found under src/config.ts)

```bash

git clone https://github.com/edraj/frontend-skeleton.git
cd frontend-skeleton
yarn install
yarn dev

```

----

## Todos

### Issues 

- [ ] Use caching to improve speed and survive network outage.
- [ ] Improve Logs / Healthcheck space listing and fix the goto issue
- [ ] Improve the attachment listing look and feel
- [ ] Loading a single entry (e.g. main entry or schema) should always use the entry api instead of query.
- [ ] When attempting to leave a modified JsonEditor the user should see an alert


### Features

- [ ] History section
- [ ] Bind search input
- [ ] Implement Data quality
- [ ] Implement Vitest
- [ ] Implement vitest (check routify/starter-vitest example)
- [ ] Migrate Console (terminal)
