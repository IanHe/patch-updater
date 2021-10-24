# refer: https://medium.com/geekculture/setup-a-lambda-function-using-docker-72356e0a4f13
# refer: https://github.com/aws/aws-lambda-nodejs-runtime-interface-client

# Define custom function directory
ARG FUNCTION_DIR="/function"

FROM node:14-alpine

# Include global arg in this stage of the build
ARG FUNCTION_DIR

RUN apk update

RUN apk add \
    g++ \
    make \
    cmake \
    unzip \
    curl-dev \
    autoconf \
    automake \
    libtool \
    libexecinfo-dev \
    python3

# Copy function code
RUN mkdir -p ${FUNCTION_DIR}
COPY dist/config/* ${FUNCTION_DIR}/*
COPY dist/* ${FUNCTION_DIR}/

WORKDIR ${FUNCTION_DIR}

RUN npm install aws-lambda-ric
RUN npm install --production

ENTRYPOINT ["/usr/local/bin/npx", "aws-lambda-ric"]
CMD ["app.lambdaHandler"]



