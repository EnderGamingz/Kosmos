# Switching from alpine to debian as openssl comilation issues for webauthn
FROM rust:1.80.1-bookworm AS builder

WORKDIR /usr/src

RUN USER=root cargo new kosmos
RUN apt-get update && apt-get install -y pkg-config libssl-dev


COPY Cargo.toml /usr/src/kosmos/
COPY .sqlx /usr/src/kosmos/.sqlx
COPY migrations /usr/src/kosmos/migrations

ENV SQLX_OFFLINE=true

WORKDIR /usr/src/kosmos

RUN rustup target add x86_64-unknown-linux-gnu
RUN cargo build --target x86_64-unknown-linux-gnu --release

COPY src /usr/src/kosmos/src/

RUN touch /usr/src/kosmos/src/main.rs
RUN cargo build --target x86_64-unknown-linux-gnu --release


FROM debian:bookworm-20240701-slim AS runtime

RUN apt-get update && apt-get install -y ca-certificates gnupg2 curl
RUN sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
RUN apt-get update -y && apt install postgresql-16 -y
RUN rm -rf /var/lib/apt/lists/* && mkdir -p /app/uploads

COPY --from=builder /usr/src/kosmos/target/x86_64-unknown-linux-gnu/release/kosmos /app/kosmos

CMD ["/app/kosmos"]