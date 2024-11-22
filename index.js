const express = require('express')
const { validateUrl } = require('./controllers/validationController');
const { scrapeTerms } = require('./controllers/scrapingController');
const { parseText } = require('./controllers/parsingController');
const app = express()
const port = 3000

app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/scrape', validateUrl, scrapeTerms, parseText, (req, res) => {
    // This final handler will only be reached if none of the middleware sends a response.
    if (!res.headersSent) {
        res.status(204).send("No information was found");
    }
  });
  
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});