#!/bin/sh
set -eu
# Compile C++ source if present
if [ -f /workspace/solution.cpp ]; then
  g++ -O2 -pipe -static -s -o /workspace/solution /workspace/solution.cpp 2> /workspace/compile.stderr || exit 1
fi
