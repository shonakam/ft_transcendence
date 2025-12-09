ui            = true
cluster_addr  = "https://0.0.0.0:8201"
api_addr      = "https://0.0.0.0:8200"
disable_mlock = true

listener "tcp" {
  address       = "0.0.0.0:8200"
}

telemetry {
  statsite_address = "0.0.0.0:8125"
  disable_hostname = true
}
