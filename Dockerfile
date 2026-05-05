# Root Dockerfile for Docker Hub and manual `docker build` usage.
# Keep this in sync with `docker/Dockerfile` when the container build changes.

# BASE #
FROM node:20-alpine AS base

WORKDIR /app
ARG TARGETPLATFORM
ENV NEXADASH_IMAGE=base
ENV NEXADASH_RUNNING_IN_DOCKER=true

RUN \
  /bin/echo ">> installing dependencies" &&\
  apk update &&\
  apk --no-cache add \
    lsblk \
    mdadm \
    dmidecode \
    coreutils \
    util-linux \
    lm-sensors &&\
  if [ "$TARGETPLATFORM" = "linux/amd64" ] || [ "$(uname -m)" = "x86_64" ]; \
    then \
      /bin/echo ">> installing dependencies (amd64)"; \
  elif [ "$TARGETPLATFORM" = "linux/arm64" ] || [ "$(uname -m)" = "aarch64" ]; \
    then \
      /bin/echo ">> installing dependencies (arm64)" &&\
      apk --no-cache add raspberrypi; \
  elif [ "$TARGETPLATFORM" = "linux/arm/v7" ]; \
    then \
      /bin/echo ">> installing dependencies (arm/v7)" &&\
      apk --no-cache add raspberrypi; \
  else /bin/echo "Unsupported platform"; exit 1; \
  fi

# DEV #
FROM base AS dev

EXPOSE 3001
EXPOSE 3000

RUN \
  /bin/echo -e ">> installing dependencies (dev)" &&\
  apk --no-cache add \
    git &&\
  git config --global --add safe.directory /app

# BUILD #
FROM base AS build

ARG BUILDHASH
ARG VERSION

ENV NODE_ENV=production

RUN \
  /bin/echo -e ">> installing dependencies (build)" &&\
  apk --no-cache add \
    git \
    make \
    clang \
    build-base &&\
  git config --global --add safe.directory /app &&\
  /bin/echo -e "{\"version\":\"$VERSION\",\"buildhash\":\"$BUILDHASH\"}" > /app/version.json

COPY . ./

RUN \
  yarn install &&\
  yarn build:prod &&\
  node scripts/strip_package_json.js

# PROD #
FROM base AS prod

ENV NODE_ENV=production

EXPOSE 3001

COPY --from=build /app/version.json .
COPY --from=build /app/.yarn/releases .yarn/releases
COPY --from=build /app/.yarnrc.yml .yarnrc.yml
COPY --from=build /app/apps/server/dist server/dist
COPY --from=build /app/apps/view/dist view/dist
COPY --from=build /app/apps/cli/dist cli/dist
COPY --from=build /app/dist/package.json package.json

RUN yarn

CMD ["node", "server/dist/index.cjs"]
