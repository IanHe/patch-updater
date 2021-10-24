#!/bin/sh

rm -rf ./dist
npm run build
npm run postBuild
docker build -t patch-updater .