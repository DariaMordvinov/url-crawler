const { trimText } = require('../../controllers/parsingController');

describe('trimText function', () => {
    it('should return relevant paragraphs containing keywords', () => {
      const termsText = `
        These terms prohibit activities such as crawling or scraping.
        You may not use a spider or similar tools.
        General information about our website.
      `;
  
      const result = trimText(termsText);
  
      expect(result).toBe(
        'These terms prohibit activities such as crawling or scraping. You may not use a spider or similar tools.'
      );
    });
    
    it('should handle empty input gracefully', () => {
      const termsText = '';
  
      const result = trimText(termsText);
  
      expect(result).toBe('');
    });
  
    it('should handle text with mixed-case keywords', () => {
      const termsText = `
        These terms prohibit activities such as Crawling or Scraping.
        Spiders are also not allowed.
      `;
  
      const result = trimText(termsText);
  
      expect(result).toBe(
        'These terms prohibit activities such as Crawling or Scraping. Spiders are also not allowed.'
      );
    });
  
    it('should trim unnecessary spaces in the result', () => {
      const termsText = `
        These terms prohibit crawling or scraping.  
         
        General information about the website.
      `;
  
      const result = trimText(termsText);
  
      expect(result).toBe('These terms prohibit crawling or scraping.');
    });
  });
