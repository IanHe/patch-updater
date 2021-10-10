rm -rf ./dist
npm run build
npm run postBuild
cd dist && zip -r ../lambda.zip .