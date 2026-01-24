#!/bin/sh
set -eu

if [ -z "$TIME_LIMIT_MS" ]; then TIME_LIMIT_MS=2000; fi
if [ -z "$OUTPUT_LIMIT_BYTES" ]; then OUTPUT_LIMIT_BYTES=65536; fi
TIME_SEC=`expr $TIME_LIMIT_MS / 1000`
if [ "$TIME_SEC" -le 0 ]; then TIME_SEC=1; fi

STDIN=${WORKSPACE_STDIN:-/workspace/stdin.txt}
STDOUT=/workspace/stdout.txt
STDERR=/workspace/stderr.txt
TIMEFILE=/workspace/time.txt
EXITCODE=/workspace/exitcode.txt

if [ -f /workspace/Main.class ]; then
  START=`date +%s%3N`
  timeout --preserve-status ${TIME_SEC}s java -cp /workspace Main < ${STDIN} > ${STDOUT} 2> ${STDERR} || true
  END=`date +%s%3N`
  ELAPSED_MS=`expr $END - $START`
  echo $ELAPSED_MS > ${TIMEFILE}
  echo $? > ${EXITCODE}
else
  echo "NO_CLASS" > ${STDERR}
  echo 127 > ${EXITCODE}
fi

if [ -f ${STDOUT} ]; then head -c ${OUTPUT_LIMIT_BYTES} ${STDOUT} > ${STDOUT}.tmp && mv ${STDOUT}.tmp ${STDOUT} || true; fi
if [ -f ${STDERR} ]; then head -c ${OUTPUT_LIMIT_BYTES} ${STDERR} > ${STDERR}.tmp && mv ${STDERR}.tmp ${STDERR} || true; fi
