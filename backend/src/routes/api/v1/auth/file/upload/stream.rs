use futures::{Stream, TryStreamExt};
use axum::body::Bytes;
use axum::BoxError;
use std::io;
use tokio_util::io::StreamReader;
use tokio::io::BufWriter;
use tokio::fs::File;

pub async fn stream_to_file<S, E>(path: &str, name: &str, stream: S) -> Result<u64, String>
where
    S: Stream<Item = Result<Bytes, E>>,
    E: Into<BoxError>,
{
    async {
        // Convert the stream into an `AsyncRead`.
        let body_with_io_error = stream.map_err(|err| io::Error::new(io::ErrorKind::Other, err));
        let body_reader = StreamReader::new(body_with_io_error);
        futures::pin_mut!(body_reader);

        // Create the file. `File` implements `AsyncWrite`.
        let path = std::path::Path::new(path).join(name);
        let mut file = BufWriter::new(File::create(&path).await?);

        // Copy the body into the file.
        match tokio::io::copy(&mut body_reader, &mut file).await {
            Err(e) => {
                tracing::error!("Error copying file from stream: {}", e);
                let _ = tokio::fs::remove_file(&path).await;
                return Err(e);
            }
            Ok(len) => Ok(len),
        }
    }
    .await
    .map_err(|err| err.to_string())
}