# Claude Telegram Bot with BBC News & Email Tools

A Telegram chatbot powered by **Anthropic Claude** that can:
- Answer questions conversationally
- Fetch latest **BBC News** headlines
- **Send emails** on user request

The bot is designed to run on **Railway** and demonstrates Claude tool-calling with real-world integrations.

---

## Features

- 🤖 Telegram chatbot powered by Claude
- 📰 BBC News scraping (top stories)
- 📧 Email sending via SMTP (Gmail example)
- 🧠 Claude tool usage (`get_bbc_news`, `send_email`)
- 🚀 Ready for Railway deployment

---

## Project Structure
```
.
├── index.js # Main bot logic (Telegram + Claude)
├── tools.js # News scraping and email tools
├── package.json
├── .env.example # Environment variable template
└── README.md
```

---

## How It Works

1. User sends a message to the Telegram bot
2. Message is sent to Claude
3. Claude decides whether to:
   - Respond directly, or
   - Call a tool (`get_bbc_news` or `send_email`)
4. If a tool is called:
   - The tool runs locally
   - The result is sent back to Claude
5. Claude returns a final response to the user

This uses **Claude’s tool-calling (function calling) flow**.

---

## Tools

### 📰 `get_bbc_news`
Scrapes the BBC News homepage and returns the top 5 headlines.

**Used when:**
- User asks about news
- User asks what’s happening in the world

---

### 📧 `send_email`
Sends an email using Nodemailer.

**Used when:**
- User asks to send an email
- User provides recipient, subject, and body

---

## Requirements

- Node.js **18+** (Node 20 recommended)
- Telegram Bot Token
- Anthropic API Key
- Email credentials (SMTP / Gmail)

---

## Environment Variables

Create a `.env` file (or configure these in Railway):

```env
TELEGRAM_TOKEN=your_telegram_bot_token
ANTHROPIC_API_KEY=your_anthropic_api_key
EMAIL_USER=your_email_address
EMAIL_PASSWORD=your_email_app_password

```
--- 

## Deployment (Railway)

### Method 1: Using Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up

# Add environment variables
eg. railway variables set TELEGRAM_TOKEN="your_token"

```
### Method 2: Using GitHub
```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main

# Then in Railway:
# 1. Go to railway.app/dashboard
# 2. Click "New Project"
# 3. Select "Deploy from GitHub"
# 4. Choose your repository
# 5. Add environment variables in Railway dashboard
```
⚠️ Polling works locally but webhooks are recommended for production
 
---

## Notes & Limitations

- BBC scraping relies on page structure and may break if BBC updates their HTML
- Email uses Gmail. Adjust if you need other providers:
```
SendGrid
Mailgun
Resend
```
- Polling is not ideal for Railway long-running services