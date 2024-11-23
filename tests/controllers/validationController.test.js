const { validateUrl } = require('../../controllers/validationController');
const httpMocks = require('node-mocks-http');

describe('validateUrl Middleware', () => {
  it('should call next if a valid URL is provided', () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        url: 'https://example.com',
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    validateUrl(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
  });

  it('should return 400 if no URL is provided', () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {},
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    validateUrl(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Please provide a URL.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if an invalid URL is provided', () => {
    const req = httpMocks.createRequest({
      method: 'POST',
      body: {
        url: 'invalid-url',
      },
    });
    const res = httpMocks.createResponse();
    const next = jest.fn();

    validateUrl(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Please provide a URL.' });
    expect(next).not.toHaveBeenCalled();
  });
});
