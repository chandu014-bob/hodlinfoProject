async function fetchCryptoData() {
    try {
      const response = await fetch('/api/crypto');
      const data = await response.json();
      displayCryptoData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  
  function displayCryptoData(data) {
    const tableBody = document.querySelector('#crypto-table tbody');
    tableBody.innerHTML = ''; // Clear any existing rows
  
    const conversionRate = 75; // Conversion rate from USD to INR
  
    data.forEach(crypto => {
      const name = crypto.name;
      const lastTradedPriceInINR = (crypto.last_traded_price * conversionRate).toFixed(2);
      const buyPriceInINR = (crypto.buy_price * conversionRate).toFixed(2);
      const sellPriceInINR = (crypto.sell_price * conversionRate).toFixed(2);
      const difference = crypto.difference.toFixed(2);
      const savingsInINR = (crypto.savings * conversionRate).toFixed(2);
  
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${name}</td>
        <td>₹${lastTradedPriceInINR}</td>
        <td>₹${buyPriceInINR}</td>
        <td>₹${sellPriceInINR}</td>
        <td>${difference}%</td>
        <td>₹${savingsInINR}</td>
      `;
      tableBody.appendChild(row);
    });
  }