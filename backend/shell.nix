{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    pkg-config
    openssl
  ];

  # Ensure rustc/cargo can find openssl at runtime/compile time
  PKG_CONFIG_PATH = "${pkgs.openssl.dev}/lib/pkgconfig";
}