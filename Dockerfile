FROM node:14-alpine

RUN apk add zip

ARG FUNCTION_DIR="/function"

RUN mkdir -p ${FUNCTION_DIR}
COPY dist/config/* ${FUNCTION_DIR}/
COPY dist/* ${FUNCTION_DIR}/

WORKDIR ${FUNCTION_DIR}

RUN npm install --production

RUN zip -r lambda.zip *

CMD ["app.lambdaHandler"]