FROM rust:alpine3.20 as builder

WORKDIR /usr/src

RUN USER=root cargo new kosmos
RUN apk update && apk add musl-dev pkgconfig libressl-dev


COPY Cargo.toml /usr/src/kosmos/
COPY .sqlx /usr/src/kosmos/.sqlx
COPY migrations /usr/src/kosmos/migrations

ENV SQLX_OFFLINE=true

WORKDIR /usr/src/kosmos

RUN rustup target add x86_64-unknown-linux-musl
RUN cargo build --target x86_64-unknown-linux-musl --release

COPY src /usr/src/kosmos/src/

RUN touch /usr/src/kosmos/src/main.rs
RUN cargo build --target x86_64-unknown-linux-musl --release


FROM alpine:3.20.2 AS runtime
USER root

RUN apk --no-cache add ca-certificates gcompat \
  && update-ca-certificates \
RUN mkdir -p /app/uploads
COPY --from=builder /usr/src/kosmos/target/x86_64-unknown-linux-musl/release/kosmos /app/kosmos
RUN chmod +x /app
CMD ["/app/kosmos"]
