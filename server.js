const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 3000;

// PostgreSQL client setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hodlinfo.db',
  password: '11may2002',
  port: 5432,
});

app.use(express.static('public'));

// Fetch data from WazirX API and store it in PostgreSQL
async function fetchAndStoreCryptoData() {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = response.data;

    // Filter data to include only those with quote_unit 'inr'
    const inrData = Object.values(data).filter(item => item.quote_unit === 'inr');

    // Clear existing data in the table
    await pool.query('DELETE FROM cryptos');

    // Insert grouped data into the table
    for (const item of inrData) {
      const name = item.name;
      const lastTradedPrice = parseFloat(item.last);
      const buyPrice = parseFloat(item.buy);
      const sellPrice = parseFloat(item.sell);
      const difference = ((sellPrice - buyPrice) / buyPrice) * 100;
      const savings = sellPrice - buyPrice;

      const query = 'INSERT INTO cryptos(name, last_traded_price, buy_price, sell_price, difference, savings) VALUES($1, $2, $3, $4, $5, $6)';
      const values = [name, lastTradedPrice, buyPrice, sellPrice, difference, savings];
      await pool.query(query, values);
      
    }
    const result = await pool.query('SELECT * FROM cryptos');
    
    console.log('Data updated successfully');
  } catch (error) {
    console.error('Error fetching or storing data:', error);
  }
}

// Fetch and store data on server start
fetchAndStoreCryptoData();

// Fetch and store data every 5 minutes
setInterval(fetchAndStoreCryptoData, 300000);

// API route to get data from PostgreSQL
app.get('/api/crypto', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cryptos');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching data from PostgreSQL:', error);
    res.status(500).send('Server Error');
  }
});

app.listen(3001, () => {
  console.log(`Server running on http://localhost:3001`);
});