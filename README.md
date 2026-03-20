# n8n-nodes-selector

This is an n8n community node package. It provides two custom nodes for your n8n workflows:

- **Selector** — Dynamically switch between multiple inputs based on conditions.
- **Telegram Raw** — Call any Telegram Bot API method with a raw JSON body.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)
[Nodes](#nodes)
[Compatibility](#compatibility)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Nodes

### Selector

The Selector node routes data through one of several inputs based on a condition. It offers two modes:

#### Single Select

- Accepts two inputs.
- Evaluates a **boolean condition** (using n8n's filter/condition UI).
- Passes through **Input 1** if the condition is true, or **Input 2** if false.
- Optionally **waits for all inputs** before processing.

#### Multi Select

- Accepts a **dynamic number of inputs** (1–15, configured via the "Number of Inputs" parameter).
- Evaluates a **numeric index** (starting from 0) to select which input to pass through.
- Optionally **waits for all inputs** before processing.

### Telegram Raw

The Telegram Raw node lets you call **any** [Telegram Bot API](https://core.telegram.org/bots/api) method directly with a raw JSON body. This is useful when the built-in Telegram node does not expose the method you need, or when you want full control over the request payload.

- **Credentials**: Uses the `telegramApi` credential (Bot token + base URL).
- **API Method**: Any valid Telegram Bot API method name (e.g. `sendMessage`, `sendPhoto`, `getChat`, `setWebhook`).
- **JSON Body**: The full request body as JSON, passed directly to the API.
- Supports **Continue on Fail** — errors are caught per item and returned as `{ error: "..." }` instead of stopping the workflow.

## Compatibility

These nodes are compatible with n8n v1.0 and later. They have been tested against the latest stable n8n versions.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [n8n official website](https://n8n.io/)
* [Telegram Bot API documentation](https://core.telegram.org/bots/api)

## Version history

- **v1.0.0** — Initial release with Selector node (Single Select and Multi Select).
- **v1.0.1** — Added Telegram Raw node.
