#!/bin/sh
set -eu
if [ -f /workspace/Main.java ]; then
  javac /workspace/Main.java 2> /workspace/compile.stderr || exit 1
fi
