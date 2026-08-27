# Campaign Studio CLI

Composable developer client for the Campaign Studio ASP.NET API.

```bash
npm link
campaign-studio help
campaign-studio --json validate --file examples/brief.json
campaign-studio generate --file examples/brief.json
campaign-studio get <campaign-id>
campaign-studio export <campaign-id> --out campaign.json
```

Read commands support `--json`; diagnostics and failures use stderr. `generate` is an explicit consequential command. `export` refuses to overwrite an existing file.

