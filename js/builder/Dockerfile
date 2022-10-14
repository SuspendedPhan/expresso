FROM debian:11

RUN apt-get update

RUN apt-get install -y curl

RUN curl -L https://go.dev/dl/go1.19.2.linux-amd64.tar.gz \
  | tar -xzC /usr/local

RUN apt-get install -y nodejs
RUN apt-get install -y npm

ENV PATH="${PATH}:/usr/local/go/bin"