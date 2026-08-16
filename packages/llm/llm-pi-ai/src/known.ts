/**
 * Catalog overlays this package ships for providers the installed pi-ai
 * registry does not yet describe. Each overlay is a complete pi-ai `Provider`
 * so a profile that names only a credential inherits endpoint, protocol, and
 * models the same way a builtin catalog route does.
 *
 * Overlay ids that pi-ai later ships are dropped: the builtin registry wins,
 * and this file is then only a stale default.
 *
 * @module dsh-llm-pi-ai/known
 */

import { createProvider } from '@earendil-works/pi-ai'
import type { Api, Model, Provider } from '@earendil-works/pi-ai'
import { openAICompletionsApi } from '@earendil-works/pi-ai/api/openai-completions.lazy'

/** Route key for the Nous Research Inference API overlay. */
export const NOUS_PROVIDER = 'nous'

/** Display name the Models page and selectors show for {@link NOUS_PROVIDER}. */
export const NOUS_DISPLAY_NAME = 'Nous Research'

/** Public OpenAI-compatible endpoint documented at portal.nousresearch.com/api-docs. */
export const NOUS_BASE_URL = 'https://inference-api.nousresearch.com/v1'

/**
 * Official chat models the Inference API documents, in the order the API docs
 * list them. Context is 128k; `max_tokens` is capped at 32_000 on the wire.
 */
const NOUS_MODELS: readonly Model<Api>[] = [
  {
    id: 'Hermes-4.3-36B',
    name: 'Hermes-4.3-36B',
    api: 'openai-completions',
    provider: NOUS_PROVIDER,
    baseUrl: NOUS_BASE_URL,
    input: ['text'],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000,
    reasoning: false,
  },
  {
    id: 'Hermes-4-70B',
    name: 'Hermes-4-70B',
    api: 'openai-completions',
    provider: NOUS_PROVIDER,
    baseUrl: NOUS_BASE_URL,
    input: ['text'],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000,
    reasoning: false,
  },
  {
    id: 'Hermes-4-405B',
    name: 'Hermes-4-405B',
    api: 'openai-completions',
    provider: NOUS_PROVIDER,
    baseUrl: NOUS_BASE_URL,
    input: ['text'],
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    contextWindow: 128_000,
    maxTokens: 32_000,
    reasoning: false,
  },
]

/**
 * Api-key auth for an overlay the harness authenticates itself. Matches the
 * method `provider.ts` attaches to a hand-declared route: the key arrives per
 * request as the stream option, never at construction.
 */
function overlayApiKeyAuth(name: string): NonNullable<Provider['auth']['apiKey']> {
  return {
    name,
    resolve: ({ credential }) => Promise.resolve({
      auth: credential?.key === undefined ? {} : { apiKey: credential.key },
      source: name,
    }),
  }
}

const overlays: readonly Provider[] = [
  createProvider({
    id: NOUS_PROVIDER,
    name: NOUS_DISPLAY_NAME,
    baseUrl: NOUS_BASE_URL,
    auth: { apiKey: overlayApiKeyAuth(NOUS_DISPLAY_NAME) },
    models: NOUS_MODELS,
    api: openAICompletionsApi(),
  }),
]

/**
 * Overlay providers this package adds on top of pi-ai's builtin registry.
 * @returns the overlay providers, in declaration order.
 */
export function knownProviders(): readonly Provider[] {
  return overlays
}

/**
 * Overlay display name for a catalog route this package owns. pi-ai builtins
 * have no entry: their directory label stays the route key so gaining a
 * profile cannot rename every card to the installed provider's own name.
 * @param provider - provider route key.
 * @returns the overlay display name, or `undefined` for a pi-ai builtin.
 */
export function catalogDisplayName(provider: string): string | undefined {
  return overlays.find(overlay => overlay.id === provider)?.name
}
