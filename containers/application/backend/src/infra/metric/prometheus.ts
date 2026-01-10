import client from "prom-client";

export function initPrometheus() {
  client.collectDefaultMetrics({prefix: "ft_"});
}
