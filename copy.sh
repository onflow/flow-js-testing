#!/bin/sh

FILES=$(find ./src -name '*.cdc')

cp -u $FILES --parents ./dist
mv ./dist/src/* ./dist
rm -rf ./dist/src
