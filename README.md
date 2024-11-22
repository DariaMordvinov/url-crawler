# Scraping check tool

### How to start the server locally
1. Copy this repository to your local machine.
2. Obtain Gemini API key: https://ai.google.dev/aistudio (sign in and click "Get API key")

![Gemini Interface](./assets/gemini.png)

3. Run the following commands:
```
npm i
node index.js
```

### Features
1. Accepts url to the website
2. Validates url before processing it
3. Looks for the Terms & Conditions page
4. Processes information on web scraping / crawling in the T&C
5. Returns the verdict to the user

### How it works
The logic behind the tool is simple. We take an URL to the website, validate it with the validation controller middleware, than passing it to the scraping controller. We open the link and search for the Terms & Conditions programmatically. After finding (if there is any) the link, we will pass the text from T&C to the parsing controller. Parsing controller takes only the paragraphs mentioning the scraping rules, and then passes them to the AI model for evaluation.

### Tech stack
* Node.js with Express
* Puppeteer (for scraping the page)
* Gemini AI model (for parsing the text)
* Dotenv (for environment variables)

### Variants of the verdict
If the URL is valid and Terms & condtitions link was found on the website, there are 3 base case scenarios:
1. No crawling mentioned in terms.
2. Terms allow crawling.
3. Terms prohibit crawling.

### Error options (for easier debugging)
1. Please provide a URL. (validationController)
2. Failed to scrape Terms & Conditions. (scrapingController)
3. No links found on the page. (scrapingController)
4. Couldn't find the Terms & Conditions link. (scrapingController)
5. The website probably uses anti-crawler software. (scrapingController)
6. Any other errors on scraping step --- Error during scraping: error message (scrapingController)
7. No terms found (parsingController)
8. Failed to parse AI response (parsingController)

### Areas for improvement
1. Optimize the look up on the website. Right now, we only parse one page - the one, that the user passed to the server. Potentially, Term & Conditions page might exist on the different route.
2. Process PDF files in case Term & Conditions page exists in the pdf format.
3.  Right now we only look for "terms" in the title of the link. We could optimize it to check for the other possible cases ("Conditions of use" / "Privacy Policy" / etc)
4. We could start by checking robot.txt document first, though it's not a legal document but a policy for robots.
5. Concentrate on bypassing anti-crawler software on the websites. For this we could use extra plugins for puppeteer, add user agent, add a delay between request to imitate human behavior, etc. However, if there is an anti-scraping software on the website, it is safe to assume the website prohibits web scraping. Also, we already send an error message that can possibly cover some of this cases ("The website probably uses anti-crawler software").





