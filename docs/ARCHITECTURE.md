# StorySync AI — Architecture

## High-level flow
1. React UI collects the story premise, genre, tone, and character details.
2. Frontend sends a JSON request to FastAPI.
3. FastAPI validates the request and calls the configured text-generation API when credentials are present.
4. The API returns three clearly separated suggestions and a short rationale for each.
5. The user decides whether to accept, reject, or edit each suggestion.
6. The frontend records the interaction events for the prototype's HAI analytics view.

## Design principles
- Human agency: AI suggestions are optional and reversible.
- Transparency: the UI indicates demo mode versus configured AI mode.
- Data minimization: this initial prototype does not transmit interaction logs to a server.
- Security: API keys are only read by the backend from environment variables.
- Research integrity: session metrics are exploratory and are not validated psychological measures.

## Next architecture increments
- Add persistent story/project storage.
- Add image generation through a separate provider adapter.
- Store interaction events in a database only after defining consent and retention rules.
- Add export of anonymized study data.
- Add unit and integration tests for scoring and logging.
