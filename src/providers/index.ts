import { appConfig } from "../config.js";
import { AdzunaProvider } from "./AdzunaProvider.js";
import { MockProvider } from "./MockProvider.js";
import { RemoteOkProvider } from "./RemoteOkProvider.js";
import type { JobProvider } from "./JobProvider.js";

const registry: Record<string, JobProvider> = {
  mock: new MockProvider(),
  remoteok: new RemoteOkProvider(),
  adzuna: new AdzunaProvider(),
};

export function getEnabledProviders(): JobProvider[] {
  return appConfig.providers
    .map((id) => registry[id])
    .filter((p): p is JobProvider => Boolean(p) && p.isConfigured());
}

export function getProvider(id: string): JobProvider | undefined {
  const provider = registry[id];
  return provider?.isConfigured() ? provider : undefined;
}

export function listProviders(): Array<{
  id: string;
  name: string;
  enabled: boolean;
  configured: boolean;
}> {
  return Object.values(registry).map((p) => ({
    id: p.id,
    name: p.name,
    enabled: appConfig.providers.includes(p.id as "mock" | "remoteok" | "adzuna"),
    configured: p.isConfigured(),
  }));
}
