const puppeteer = require('puppeteer');
const url = require('url');  // To handle relative URLs

const scrapeTerms = async (req, res, next) => {
  const { url: siteUrl } = req.body;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Listen for console logs from the browser context
    // page.on('console', (msg) => {
    //   console.log('Browser log:', msg.text()); 
    // });

    // Navigate to the URL
    await page.goto(siteUrl, { waitUntil: 'networkidle2' });

    // Find the links to the Terms & Conditions page
    const termsLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const hrefs = links.map(link => link.href);
      return hrefs; 
    });

    // Log all the links found on the page
    // console.log("Links found on page:", termsLinks);

    if (!termsLinks || termsLinks.length === 0) {
      await browser.close();
      return res.status(404).json({ error: 'No links found on the page.' });
    }

    // find the link to the Terms and conditions page
    const termsLink = termsLinks.find(link =>
      /terms/i.test(link)
    );

    if (!termsLink) {
      await browser.close();
      return res.status(404).json({ error: "Couldn't find the Terms & Conditions link." });
    }

    // Navigate to the Terms & Conditions page (whether it's a full URL or relative)
    const finalTermsLink = termsLink.startsWith('http') ? termsLink : new URL(termsLink, siteUrl).href;
    // console.log(finalTermsLink)
    await page.goto(finalTermsLink, { waitUntil: 'domcontentloaded' });

    // Get the text from the terms & conditions page
    const termsText = await page.evaluate(() => document.body.innerText);
    // console.log(termsText)
    await browser.close();

    // Pass the scraped text to the next middleware
    res.locals.termsText = termsText;
    next();


  } catch (err) {
    console.error('Error during scraping:', err);

    // some websites use anti-spider software with the added layer of protection (like Cloudflare)
    // they can block our IP address to prevent crawling or simply forbid access
    if (err.message.includes('403') || err.message.includes('blocked')) {
        return res.status(403).json({ error: 'The website probably uses anti-crawler software.' });
    }

    res.status(500).json({ error: 'Failed to scrape Terms & Conditions.' });
  }
};

module.exports = { scrapeTerms };
