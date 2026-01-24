FROM node:18-slim

RUN mkdir /workspace && chown node:node /workspace

COPY compile.sh /usr/local/bin/compile
COPY run.sh /usr/local/bin/run
RUN chmod +x /usr/local/bin/compile /usr/local/bin/run

USER node
WORKDIR /workspace
ENTRYPOINT ["/bin/sh", "-c"]
