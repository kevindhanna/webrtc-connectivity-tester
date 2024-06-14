FROM node:20-bullseye-slim

ENV NODE_ENV production

ARG DEBUG
ENV DEBUG=${DEBUG}

WORKDIR /opt

# Install node-gyp dependencies and git
# RUN apt-get update && apt-get install -y libpq-dev g++ make python3 git

# Setup users
RUN groupadd webrtctestagentgroup \
    && useradd -ms /bin/bash webrtctestagent \
    && usermod -aG webrtctestagentgroup webrtctestagent

COPY client/src /opt/src
COPY client/package.json /opt
COPY client/yarn.lock /opt

RUN yarn install --production --ignore-optional

RUN chown -R webrtctestagent:webrtctestagentgroup .

VOLUME /dev/shm:/dev/shm

USER webrtctestagent

ENTRYPOINT ["node", "src/index.js"]
