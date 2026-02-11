const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

// BBC News Scraper
async function scrapeBBCNews(topic = 'top stories') {
  try {
    console.log(`🔍 Scraping BBC News for: ${topic}`);
    
    const response = await axios.get('https://www.bbc.com/news', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const articles = [];
    
    // BBC's structure - adjust selectors if needed
    $('h2').each((i, element) => {
      if (i < 5) { // Get top 5 stories
        const title = $(element).text().trim();
        const link = $(element).closest('a').attr('href');
        
        if (title && link) {
          const fullLink = link.startsWith('http') ? link : `https://www.bbc.com${link}`;
          articles.push({ title, link: fullLink });
        }
      }
    });
    
    console.log(`✅ Found ${articles.length} articles`);
    return articles;
    
  } catch (error) {
    console.error('❌ Error scraping BBC:', error.message);
    return { error: `Failed to scrape BBC News: ${error.message}` };
  }
}

// Email Sender
async function sendEmail(to, subject, body) {
  try {
    console.log(`📧 Sending email to: ${to}`);
    
    // Create transporter (using Gmail as example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: body
    });
    
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { error: `Failed to send email: ${error.message}` };
  }
}



module.exports = {
  scrapeBBCNews,
  sendEmail
};