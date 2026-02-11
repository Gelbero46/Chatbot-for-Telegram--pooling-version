require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Anthropic = require('@anthropic-ai/sdk');
const { scrapeBBCNews, sendEmail } = require('./tools');

const token = process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

console.log('✅ Bot is running on Railway with News & Email capabilities...');

// Define tools for Claude
const tools = [
  {
    name: "get_bbc_news",
    description: "Fetches the latest top stories from BBC News. Use this when the user asks about news, current events, or what's happening in the world.",
    input_schema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          description: "The news topic (optional, defaults to 'top stories')"
        }
      },
      required: []
    }
  },
  {
    name: "send_email",
    description: "Sends an email to a specified recipient. Use this when the user asks to send an email or message someone via email.",
    input_schema: {
      type: "object",
      properties: {
        to: {
          type: "string",
          description: "The recipient's email address"
        },
        subject: {
          type: "string",
          description: "The email subject line"
        },
        body: {
          type: "string",
          description: "The email body/content"
        }
      },
      required: ["to", "subject", "body"]
    }
  }
];

// Handle messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name;
  const userMessage = msg.text;

  console.log(`📩 Message from ${userName}: ${userMessage}`);

  try {
    bot.sendChatAction(chatId, 'typing');

    // Initial call to Claude with tools
    let messages = [{ role: 'user', content: userMessage }];
    
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      tools: tools,
      messages: messages
    });

    console.log('📊 Claude response:', JSON.stringify(response, null, 2));

    // Process tool use
    if (response.stop_reason === 'tool_use') {
      const toolUse = response.content.find(block => block.type === 'tool_use');
      
      if (toolUse) {
        console.log(`🔧 Tool called: ${toolUse.name}`);
        
        let toolResult;
        
        // Execute the appropriate tool
        if (toolUse.name === 'get_bbc_news') {
          const articles = await scrapeBBCNews(toolUse.input.topic);
          toolResult = JSON.stringify(articles);
        } else if (toolUse.name === 'send_email') {
          const result = await sendEmail(
            toolUse.input.to,
            toolUse.input.subject,
            toolUse.input.body
          );
          toolResult = JSON.stringify(result);
        }
        
        // Send tool result back to Claude
        messages.push({
          role: 'assistant',
          content: response.content
        });
        
        messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: toolResult
            }
          ]
        });
        
        // Get final response from Claude
        const finalResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          tools: tools,
          messages: messages
        });
        
        const textContent = finalResponse.content.find(block => block.type === 'text');
        if (textContent) {
          bot.sendMessage(chatId, textContent.text);
          console.log(`✅ Response sent`);
        }
      }
    } else {
      // No tool use, just send the text response
      const textContent = response.content.find(block => block.type === 'text');
      if (textContent) {
        bot.sendMessage(chatId, textContent.text);
        console.log(`✅ Response sent`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    bot.sendMessage(chatId, `Sorry, I encountered an error: ${error.message}`);
  }
});

bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error);
});
