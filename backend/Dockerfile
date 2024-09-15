# Switching from alpine to debian as openssl comilation issues for webauthn
FROM rust:1.80.1-bookworm AS builder

WORKDIR /usr/src

# Pre-create a new Rust project
RUN USER=root cargo new --bin kosmos

# Install build dependencies
RUN apt-get update && apt-get install -y pkg-config libssl-dev


COPY Cargo.toml Cargo.lock /usr/src/kosmos/
COPY .sqlx /usr/src/kosmos/.sqlx
COPY migrations /usr/src/kosmos/migrations
COPY backup.sh /usr/src/kosmos/backup.sh
COPY restore.sh /usr/src/kosmos/restore.sh

ENV SQLX_OFFLINE=true

WORKDIR /usr/src/kosmos

# Build the dependencies first to leverage Docker layer caching
RUN cargo build --release --target x86_64-unknown-linux-gnu
RUN rm -rf src

COPY src /usr/src/kosmos/src/

RUN touch /usr/src/kosmos/src/main.rs
# Build the final binary
RUN cargo build --release --target x86_64-unknown-linux-gnu

# Strip the binary
RUN strip target/x86_64-unknown-linux-gnu/release/kosmos

FROM debian:bookworm-20240701-slim AS runtime

WORKDIR /app

# Install utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates gnupg2 curl

# PostgreSQL repository
RUN sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg

# Install PostgreSQL client
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    postgresql-client-16 \
    && rm -rf /var/lib/apt/lists/*

# Create directories and copy binary
RUN mkdir -p /app/uploads
COPY --from=builder /usr/src/kosmos/target/x86_64-unknown-linux-gnu/release/kosmos /app
COPY --from=builder /usr/src/kosmos/backup.sh /app
COPY --from=builder /usr/src/kosmos/restore.sh /app

RUN cd /app && chmod +x backup.sh restore.sh

CMD ["/app/kosmos"]