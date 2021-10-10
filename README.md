https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.Lambda.Tutorial.html
https://www.fernandomc.com/posts/eight-examples-of-fetching-data-from-dynamodb-with-node/

aws dynamodb create-table \
--table-name cm-ods-dev-customer-patch \
--attribute-definitions AttributeName=partitionKey,AttributeType=S AttributeName=sorId,AttributeType=S \
--key-schema AttributeName=partitionKey,KeyType=HASH  AttributeName=sorId,KeyType=RANGE \
--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
--stream-specification StreamEnabled=true,StreamViewType=NEW_AND_OLD_IMAGES

aws dynamodb create-table \
--table-name customer-dev-individual \
--attribute-definitions AttributeName=partitionKey,AttributeType=S AttributeName=sortKey,AttributeType=S \
--key-schema AttributeName=partitionKey,KeyType=HASH  AttributeName=sortKey,KeyType=RANGE \
--provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5


"LatestStreamArn": "arn:aws:dynamodb:ap-southeast-2:727861035172:table/cm-ods-dev-customer-patch/stream/2021-10-07T10:56:47.037"

region: ap-southeast-2
accountId: 727861035172


aws iam create-role --role-name MyLambdaRole \
--path "/service-role/" \
--assume-role-policy-document file://${PWD}/json/trust-relationship.json

aws iam put-role-policy --role-name MyLambdaRole \
--policy-name MyLambdaRolePolicy \
--policy-document file://${PWD}/json/role-policy.json



arn:aws:iam::727861035172:role/service-role/MyLambdaRole


aws lambda create-function \
--region ap-southeast-2 \
--function-name patchUpdaterTest \
--zip-file fileb://${PWD}/hello-world/app.zip \
--role arn:aws:iam::727861035172:role/service-role/MyLambdaRole \
--handler app.lambdaHandler \
--timeout 5 \
--runtime nodejs14.x

aws lambda invoke --function-name patchUpdaterTest \
--invocation-type Event \
--cli-binary-format raw-in-base64-out \
--payload file://${PWD}/json/payload.json output.txt


arn:aws:dynamodb:ap-southeast-2:727861035172:table/cm-ods-dev-customer-patch/stream/2021-10-07T10:56:47.037

aws lambda create-event-source-mapping \
--region ap-southeast-2 \
--function-name patchUpdaterTest \
--event-source arn:aws:dynamodb:ap-southeast-2:727861035172:table/cm-ods-dev-customer-patch/stream/2021-10-07T10:56:47.037  \
--batch-size 1 \
--starting-position TRIM_HORIZON

aws dynamodb put-item \
--table-name cm-ods-dev-customer-patch \
--item partitionKey={S="Jane Doe"},sorId={S="2016-11-18:14:32:17"},Message={S="Testing...1...2...3"}

aws lambda update-function-code --function-name patchUpdaterTest --zip-file fileb://${PWD}/hello-world/app.zip