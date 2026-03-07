const { searchPostalCodes, getCitiesByCode } = require('../services/postalCodeService');
const { statusFromError } = require('../utils/lib');

async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const rows = await searchPostalCodes(q);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

async function getCities(req, res) {
  try {
    const { code } = req.params;
    const rows = await getCitiesByCode(code);
    res.json(rows);
  } catch (e) {
    res.status(statusFromError(e)).json({ error: e.message });
  }
}

module.exports = { search, getCities };