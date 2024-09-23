import { WebSdk } from "@effect/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

export const TelemetryCtxLive = WebSdk.layer(() => ({
    resource: { serviceName: "expresso" },
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: "/v1/traces",
      })
    ),
  }));