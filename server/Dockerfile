FROM npm:18

WORKDIR /app

COPY package-lock.json .
COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM keymetrics/pm2:16-jessie

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
ENV TZ="Asia/Shanghai"

RUN npm install npm -g

RUN npm install --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/bootstrap.js ./
COPY --from=builder /app/script ./script
COPY --from=builder /app/src/config ./src/config
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src/migration ./src/migration

EXPOSE 7001

CMD ["npm", "run", "start"]
