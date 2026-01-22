FROM gcc:12.2.0

RUN useradd -m -u 1000 runner && mkdir /workspace && chown runner:runner /workspace

COPY compile.sh /usr/local/bin/compile
COPY run.sh /usr/local/bin/run
RUN chmod +x /usr/local/bin/compile /usr/local/bin/run

USER runner
WORKDIR /workspace
ENV PATH="/usr/local/bin:$PATH"

ENTRYPOINT ["/bin/sh", "-c"]
