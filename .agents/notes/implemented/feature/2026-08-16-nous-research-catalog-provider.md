# Agent Note: Nous Research as a catalog overlay provider

Status: implemented

English | [中文](2026-08-16-nous-research-catalog-provider.zh.md)

## Problem

The Nous Research Inference API is an OpenAI-compatible chat-completions endpoint at `https://inference-api.nousresearch.com/v1`, documented at [portal.nousresearch.com/api-docs](https://portal.nousresearch.com/api-docs). Adding it as a hand-declared custom provider works, but every user has to type the endpoint, protocol, and official Hermes model ids. The installed pi-ai catalog does not ship a `nous` route, so **Add provider** cannot offer it the way it offers Anthropic or OpenAI.

## Decision

`dsh-llm-pi-ai` owns a catalog overlay in `known.ts`. The installed catalog is pi-ai's builtin providers plus those overlays. Overlay ids that pi-ai later ships are skipped so the builtin registry wins.

`nous` is the overlay for the Inference API. Its route key is `nous`, its display name is `Nous Research`, its endpoint is `https://inference-api.nousresearch.com/v1`, and it speaks `openai-completions`. The shipped models are the official Hermes chat models the API docs list, in that order: `Hermes-4.3-36B`, `Hermes-4-70B`, `Hermes-4-405B`. Each has a 128,000-token context window and a 32,000-token output cap. They are marked non-reasoning: the API enables thinking with a system prompt or a `<think>` prefill, not `reasoning_effort`.

A profile of `{ apiKeyEnv: NOUS_API_KEY }` is enough. The Models page offers the route as a catalog provider (`declared: false`) under **Add provider**. Fetch available models answers from this overlay without a network call, the same as any other catalog route. Additional model ids belong in the route's `models` list, which replaces the overlay catalog.

The overlay display name is the one exception to "catalog routes show the route key": pi-ai builtins still use the route key so gaining a profile cannot rename every card, and only overlays this package owns default `displayName` to the name in `known.ts`.

## Alternatives considered

**A dedicated `dsh-llm-nous` adapter.** The Inference API is OpenAI Chat Completions. A second fetch/SSE translator would duplicate `dsh-llm-pi-ai` without a wire-format reason.

**Leave it as a custom provider.** That is already possible and stays possible. It asks every user to restate facts the API docs already fixed.

**Ship the Portal's 300+ gateway catalog.** The official API docs list the three Hermes models. The broader Portal catalog is a different product surface, changes often, and would go stale inside this package. A deployment that wants those ids writes them on the route.

**Treat overlay discovery as a live `GET /models`.** Catalog routes answer from the installed catalog so capacities a listing would omit stay authoritative. The OpenAPI spec does not document `GET /models`. Live listing remains the path for a hand-declared route.

**Declare Hermes thinking levels.** There is no documented `reasoning_effort` parameter. Advertising `off`/`high` would show a control that cannot change the request.

## Consequences

Nous Research appears beside other catalog providers on the Models page. A stored key on `NOUS_API_KEY` serves the official Hermes models on the next request. Hermes thinking stays a prompt the deployment writes, not a picker row. When pi-ai ships its own `nous` provider, the overlay is ignored and this file becomes the stale default to delete.

## Testing

`packages/llm/llm-pi-ai/tests/catalog.spec.ts` pins overlay membership, official model ids and capacities, credential-only profile resolution, Chat Completions on the documented path, and a `declared: false` directory entry named `Nous Research`. `discovery.spec.ts` pins the no-network catalog answer. Coverage gap: no live call against `inference-api.nousresearch.com`.
