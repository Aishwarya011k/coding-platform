#!/bin/sh
set -eu
# Compile C source if present
if [ -f /workspace/solution.c ]; then
  gcc -O2 -pipe -static -s -o /workspace/solution /workspace/solution.c 2> /workspace/compile.stderr || exit 1
fi
