const { get } = require('https');
const cheerio = require('cheerio');

const loadPage = url => {
  return new Promise((resolve) => {
      get(url, res => {
          res.setEncoding('utf8');
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => resolve({ res, body: data }));
      });
  });
};

const getAvatarUrl = username => {
  return new Promise(async resolve => {
      const { body } = await loadPage(`https://www.npmjs.com/~${username}`);

      if (body.includes('NotFoundError: Scope not found')) return resolve(null);

      const $ = cheerio.load(body);
      const img = $('img');
      const full = 'https://www.npmjs.com' + img.attr('src');

      resolve(full);
  });
};

module.exports = getAvatarUrl;