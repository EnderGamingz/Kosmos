use webauthn_rs::prelude::Url;
use webauthn_rs::{Webauthn, WebauthnBuilder};

pub fn init() -> Webauthn {
    let rp_id = std::env::var("KOSMOS_RP_ID").expect("KOSMOS_RP_ID must be set");
    let rp_origin = std::env::var("KOSMOS_RP_ORIGIN").expect("KOSMOS_RP_ORIGIN must be set");
    let rp_name = std::env::var("KOSMOS_RP_NAME").expect("KOSMOS_RP_NAME must be set");

    let rp_origin = Url::parse(&rp_origin).expect("KOSMOS_RP_ORIGIN must be a valid URL");

    let builder = WebauthnBuilder::new(rp_id.as_str(), &rp_origin).expect("Failed to initialize WebauthnBuilder");
    let builder = builder.rp_name(rp_name.as_str());

    builder.build().expect("Failed to initialize Webauthn")
}