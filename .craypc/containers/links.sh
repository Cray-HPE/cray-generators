#!/bin/sh

for dir in /opt/cray-generators/generator-*/; do
  cd $dir
  npm link --no-package-lock
done