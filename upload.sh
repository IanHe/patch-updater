#!/bin/sh
#aws lambda update-function-code --function-name patchUpdaterTest --zip-file fileb://${PWD}/lambda.zip

awsAccountId=$1

aws ecr get-login-password --region ap-southeast-2 | docker login --username AWS --password-stdin "$awsAccountId".dkr.ecr.ap-southeast-2.amazonaws.com

docker tag patch-updater:latest "$awsAccountId".dkr.ecr.ap-southeast-2.amazonaws.com/patch-updater:latest

docker push "$awsAccountId".dkr.ecr.ap-southeast-2.amazonaws.com/patch-updater:latest