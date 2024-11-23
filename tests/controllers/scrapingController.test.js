const { scrapeTerms } = require('../../controllers/scrapingController');
const httpMocks = require('node-mocks-http');
const puppeteer = require('puppeteer');

jest.mock('puppeteer');

describe('scrapeTerms Controller', () => {
  let browserMock, pageMock;

  beforeEach(() => {
    pageMock = {
      goto: jest.fn(),
      evaluate: jest.fn(),
      close: jest.fn(),
    };

    browserMock = {
      newPage: jest.fn().mockResolvedValue(pageMock),
      close: jest.fn(),
    };

    puppeteer.launch.mockResolvedValue(browserMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should scrape terms text if terms link is found', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { url: 'https://example.com' },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    pageMock.evaluate
      .mockResolvedValueOnce([
        'https://example.com/terms',
        'https://example.com/privacy',
      ])
      .mockResolvedValueOnce('Terms and conditions content'); 

    await scrapeTerms(req, res, next);

    expect(pageMock.goto).toHaveBeenCalledTimes(2);
    expect(pageMock.goto).toHaveBeenCalledWith('https://example.com', { waitUntil: 'networkidle2' });
    expect(pageMock.goto).toHaveBeenCalledWith('https://example.com/terms', { waitUntil: 'domcontentloaded' });
    expect(res.locals.termsText).toBe('Terms and conditions content');
    expect(next).toHaveBeenCalled();
  });

  it('should return 404 if no links are found', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { url: 'https://example.com' },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    pageMock.evaluate.mockResolvedValueOnce([]);

    await scrapeTerms(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'No links found on the page.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 404 if terms link is not found', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { url: 'https://example.com' },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    pageMock.evaluate.mockResolvedValueOnce(['https://example.com/privacy']);

    await scrapeTerms(req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: "Couldn't find the Terms & Conditions link." });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if anti-crawler software blocks access', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { url: 'https://example.com' },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    pageMock.goto.mockRejectedValueOnce(new Error('403 Forbidden'));

    await scrapeTerms(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res._getJSONData()).toEqual({ error: 'The website probably uses anti-crawler software.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 500 if a generic error occurs', async () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: { url: 'https://example.com' },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    pageMock.goto.mockRejectedValueOnce(new Error('Generic error'));

    await scrapeTerms(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Failed to scrape Terms & Conditions.' });
    expect(next).not.toHaveBeenCalled();
  });
});
