module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  var token = process.env.GITHUB_TOKEN;
  var gistId = '643c62a3fb824da9424a1d4e6c53b17f';
  var file = 'yarn-data.json';

  try {
    if (req.method === 'GET') {
      var r = await fetch('https://api.github.com/gists/' + gistId, {
        headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' }
      });
      var j = await r.json();
      return res.json(JSON.parse(j.files[file].content));
    }
    if (req.method === 'POST') {
      var r = await fetch('https://api.github.com/gists/' + gistId, {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
        body: JSON.stringify({ files: { [file]: { content: JSON.stringify(req.body) } } })
      });
      return res.json({ ok: true, time: new Date().toISOString() });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
