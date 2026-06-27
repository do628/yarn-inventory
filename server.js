const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'data.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    return { prods: [], txns: [], categories: [], customers: [], pid: 1, tid: 1 };
  }
}

function writeData(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data), 'utf-8');
  fs.renameSync(tmp, DATA_FILE);
}

function ensureData() {
  if (!fs.existsSync(DATA_FILE)) {
    writeData({
      prods: [], txns: [], categories: [], customers: [],
      pid: 1, tid: 1
    });
  }
}

ensureData();

app.get('/api/data', (req, res) => {
  try {
    res.json(readData());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/data', (req, res) => {
  try {
    writeData(req.body);
    res.json({ ok: true, time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/backup', (req, res) => {
  try {
    const data = readData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=毛线库存备份_' + new Date().toISOString().slice(0,10) + '.json');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/import', (req, res) => {
  try {
    const importData = req.body;
    if (!importData.prods && !importData.txns) {
      return res.status(400).json({ error: '缺少产品或交易数据' });
    }
    
    const current = readData();
    let nextPid = current.pid;
    let nextTid = current.tid;

    const modelMap = {};
    const importedProducts = [];

    if (importData.prods && importData.prods.length) {
      importData.prods.forEach(p => {
        const existing = current.prods.find(
          x => x.model === p.model && x.color === p.color
        );
        if (!existing) {
          const np = { ...p, id: nextPid++ };
          current.prods.push(np);
          importedProducts.push(np);
          modelMap[p._key || `${p.model}|${p.color}`] = np.id;
        } else {
          modelMap[p._key || `${p.model}|${p.color}`] = existing.id;
        }
      });
    }

    if (importData.txns && importData.txns.length) {
      importData.txns.forEach(t => {
        const pid = modelMap[t._importKey] || null;
        const txn = {
          id: nextTid++,
          pid: pid,
          type: t.type,
          date: t.date,
          qty: t.qty || 0,
          unit: t.unit || '',
          unitwt: t.unitwt || 0,
          kg: t.kg || 0,
          price: t.price || 0,
          amt: t.amt || 0,
          customer: t.customer || '',
          operator: t.operator || '',
          notes: t.notes || '',
          outType: t.outType || ''
        };
        current.txns.push(txn);
      });
    }

    current.pid = nextPid;
    current.tid = nextTid;

    if (importData.categories && importData.categories.length) {
      importData.categories.forEach(c => {
        if (!current.categories.includes(c)) {
          current.categories.push(c);
        }
      });
    }

    if (importData.customers && importData.customers.length) {
      importData.customers.forEach(c => {
        if (!current.customers.includes(c)) {
          current.customers.push(c);
        }
      });
    }

    writeData(current);
    res.json({
      ok: true,
      imported: {
        products: importedProducts.length,
        transactions: importData.txns ? importData.txns.length : 0,
        totalProducts: current.prods.length,
        totalTransactions: current.txns.length
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`毛线库存服务启动，端口 ${PORT}`);
});
