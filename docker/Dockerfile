FROM node:lts AS prepare
COPY .nuxt /repo/.nuxt/
COPY client/static /repo/static/
COPY docker/package.json docker/nuxt.config.js /repo/
RUN cd /repo && \
    yarn --prod --frozen-lockfile

FROM node:lts
COPY --from=prepare /repo /app/
WORKDIR /app
ENV NUXT_HOST 0.0.0.0
ENV NUXT_PORT 80
EXPOSE 80
ENTRYPOINT ["yarn", "run", "start"]
