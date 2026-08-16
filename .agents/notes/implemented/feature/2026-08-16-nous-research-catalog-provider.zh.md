# Agent Note: Nous Research as a catalog overlay provider

Status: implemented

[English](2026-08-16-nous-research-catalog-provider.md) | 中文

## Problem

Nous Research Inference API 是位于 `https://inference-api.nousresearch.com/v1` 的 OpenAI 兼容 chat-completions 端点，文档在 [portal.nousresearch.com/api-docs](https://portal.nousresearch.com/api-docs)。把它加成手工声明的自定义提供方已经能用，但每个用户都得自己填写端点、协议和官方 Hermes 模型 id。已安装的 pi-ai catalog 没有 `nous` 路由，因此**添加提供方**不能像提供 Anthropic 或 OpenAI 那样提供它。

## Decision

`dsh-llm-pi-ai` 在 `known.ts` 中维护一份 catalog overlay。已安装 catalog 是 pi-ai 的内置提供方加上这些 overlay。若 pi-ai 随后收录了相同 id，该 overlay 会被跳过，以内置注册表为准。

`nous` 是 Inference API 的 overlay。路由键是 `nous`，显示名称是 `Nous Research`，端点是 `https://inference-api.nousresearch.com/v1`，协议是 `openai-completions`。随附模型是 API 文档列出的官方 Hermes 对话模型，顺序相同：`Hermes-4.3-36B`、`Hermes-4-70B`、`Hermes-4-405B`。每个模型的上下文窗口为 128,000 token，输出上限为 32,000 token。它们被标成非推理模型：API 通过系统提示或预填 `<think>` 开启思考，而不是 `reasoning_effort`。

一份 `{ apiKeyEnv: NOUS_API_KEY }` 的 profile 就够了。模型页把它当作 catalog 提供方（`declared: false`）放在**添加提供方**里。获取可用模型从这份 overlay 作答，不联网，与其他 catalog 路由相同。额外的模型 id 写在路由的 `models` 列表里，该列表会替换 overlay catalog。

overlay 显示名称是「catalog 路由展示路由键」的唯一例外：pi-ai 内置提供方仍使用路由键，以免一旦存下 profile 就把每张卡片改成已安装提供方自己的名字；只有本包拥有的 overlay 才会把 `displayName` 默认成本包在 `known.ts` 里写的名称。

## Alternatives considered

**单独做一个 `dsh-llm-nous` 适配器。** Inference API 就是 OpenAI Chat Completions。再写一套 fetch/SSE 转译会重复 `dsh-llm-pi-ai`，却没有协议格式上的理由。

**继续只当自定义提供方。** 这条路本来就通，也仍然通。它要求每个用户重述 API 文档已经固定的事实。

**收录 Portal 的 300+ 网关 catalog。** 官方 API 文档只列了三个 Hermes 模型。更广的 Portal catalog 是另一块产品面，变动频繁，放进本包会过时。部署若要那些 id，写在路由上即可。

**把 overlay 的模型发现做成实时 `GET /models`。** catalog 路由从已安装 catalog 作答，这样列表端点不会给出的容量仍然权威。OpenAPI 规范也没有记录 `GET /models`。实时列举仍是手工声明路由的路径。

**声明 Hermes 思考档位。** 文档里没有 `reasoning_effort` 参数。展示 `off`/`high` 会放出一个改不了请求的控件。

## Consequences

Nous Research 会出现在模型页上，和其他 catalog 提供方并列。把密钥存到 `NOUS_API_KEY` 后，下一次请求就能使用官方 Hermes 模型。Hermes 思考仍是部署自己写的提示，不是选择器里的一行。当 pi-ai 收录自己的 `nous` 提供方时，这份 overlay 会被忽略，本文件就变成该删掉的过时默认值。

## Testing

`packages/llm/llm-pi-ai/tests/catalog.spec.ts` 钉住 overlay 成员资格、官方模型 id 与容量、仅凭据 profile 解析、文档路径上的 Chat Completions，以及名为 `Nous Research`、`declared: false` 的目录条目。`discovery.spec.ts` 钉住不联网的 catalog 作答。覆盖缺口：没有对 `inference-api.nousresearch.com` 的实网调用。
