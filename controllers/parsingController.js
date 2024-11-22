require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Helper function to trim terms and & conditions text
// we don't want to abuse AI by sending a very long prompt, here we're trying to only find paragraphs
// referring to crawling
const trimText = (termsText) => {
  const keywords = ['scrape', 'scraping', 'crawl', 'crawling', 'spider'];
  const paragraphs = termsText.split('\n');

  const relevantParagraphs = paragraphs.filter(paragraph => 
    keywords.some(keyword => paragraph.toLowerCase().includes(keyword))
  );

  return relevantParagraphs.join(' ').trim();
}

const parseText = async (req, res, next) => {
  try {
    const termsText = res.locals.termsText;
    if (!termsText) {
        return res.status(204).json({ error: `No terms found` });
    }


    const text = trimText(termsText);

    // If no paragraphs containing "crawl" (and similar) are found, return verdict here
    if (!text || text.length === 0) {
        return res.status(200).json({ verdict: `No crawling mentioned in terms.` });
    }

    const prompt = `Your task is to determine if a website's terms of service allow or prohibit web scraping. 
                Below is the extracted text of the terms:
                ${text}

                Please respond with one word in the following format:
                "allow" | "prohibit" | "N/A"
                "allow" means the terms explicitly permit web scraping. 
                "prohibit" means the terms explicitly forbid web scraping. 
                "N/A" means the terms do not mention web scraping or its permission explicitly. 
                Be sure to check for any language that may explicitly reference web scraping or similar activities like data harvesting or bot crawling.`
    
    const result = await model.generateContent(prompt);
    // console.log(result.response.candidates[0].content.parts[0].text)
    try {
      const parsedResult = result.response.candidates[0].content.parts[0].text.trim();
      if (parsedResult) {
        const response = parsedResult === "N/A" ? `No crawling mentioned in terms.` : `Terms ${parsedResult} crawling.`;
        return res.status(200).json({ verdict: response });
      } else {
        return res.status(500).json({ error: 'Failed to parse AI response.' });
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return res.status(500).json({ error: 'Failed to parse AI response.' });
    }
  } catch (err) {
    console.error('Error analyzing terms with AI:', err);
    res.status(500).json({ error: 'Failed to analyze terms with AI.' });
  }
};

module.exports = { parseText };
