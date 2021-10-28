#!/bin/sh

rm -rf ./dist
npm run build
npm run postBuild
# build docker image
docker build -t patch-updater .
# create docker container
id=$(docker create patch-updater)
# copy lambda.zip to local
docker cp $id:/function/lambda.zip - > ./lambda.zip
# remove container and images
docker rm -f $id
docker rmi -f patch-updater
