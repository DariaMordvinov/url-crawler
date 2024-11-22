function isValidUrl(url) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (err) {
      return false;
    }
}

// basic validations of the provided url
// return 400 (bad request) if there is no url or url is not valid
const validateUrl = (req, res, next) => {
    const { url } = req.body;
  
    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ error: 'Please provide a URL.' });
    }

    next();
  };


module.exports = { validateUrl };