# OpenRouter API Configuration

## Setup

1. Environment file `.env` sudah dibuat dengan API key OpenRouter
2. Secret `OPENROUTER_API_KEY` sudah di-upload ke Cloudflare Workers

## API Key Details

- Provider: OpenRouter
- Model: `openai/gpt-oss-120b`
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`

## Deployment

Worker sudah berhasil di-deploy dengan OpenRouter integration:
- URL: https://worker-ai.daivanfebrijuansetiya.workers.dev
- Environment: Production
- Secret: OPENROUTER_API_KEY (configured)

## Testing

Untuk test API endpoints:

1. **Generate Question**: `POST /api/ai/generate-question`
2. **Evaluate Answer**: `POST /api/ai/evaluate-answer`
3. **AI Analysis**: `POST /api/ai/analyze`

Semua endpoint sekarang menggunakan OpenRouter API instead of Google Gemini.