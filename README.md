# gh-webhook-tg

GitHub webhook to cloudflare worker to Telegram, built from template https://github.com/EverlastingBugstopper/worker-typescript-template

## Supported webhook event
- ping
- commit_comment
- discussion (`created` only)
- discussion_comment (`created` only)
- issue_comment (`created` only)
- issues (`created` only)
- pull_request (`created` only)
- push

## Getting Started
- Install [wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update)
- `git clone https://github.com/JasonKhew96/gh-webhook-tg.git` or download zip
- `npm install` or `yarn install`
- Copy `wrangler.toml.example` to `wrangler.toml`
- Edit `account_id`, `BOT_TOKEN` and `CHAT_ID`
- `wrangler publish`
- Webhook url should be `https://gh-webhook-tg.{username}.workers.dev/webhook`