use lazy_static::lazy_static;
use std::env;
use tokio::runtime::Runtime;

lazy_static! {
    pub static ref IMAGE_PROCESSING_RUNTIME: Runtime = {
        let default_threads = 4;
        let threads_str =
            env::var("IMAGE_PROCESSING_THREADS").unwrap_or_else(|_| default_threads.to_string());
        let worker_threads = threads_str.parse::<usize>().unwrap_or_else(|_| {
            tracing::warn!(
                "Failed to parse IMAGE_PROCESSING_THREADS environment variable. Defaulting to {}",
                default_threads
            );
            default_threads
        });

        tokio::runtime::Builder::new_multi_thread()
            .worker_threads(worker_threads)
            .enable_all()
            .build()
            .expect("Error building tokio image processing runtime")
    };
}
