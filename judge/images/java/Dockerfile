FROM eclipse-temurin:17-jdk-jammy

RUN useradd -m -u 1000 runner && mkdir /workspace && chown runner:runner /workspace

COPY compile.sh /usr/local/bin/compile
COPY run.sh /usr/local/bin/run
RUN chmod +x /usr/local/bin/compile /usr/local/bin/run

USER runner
WORKDIR /workspace
ENTRYPOINT ["/bin/sh", "-c"]
