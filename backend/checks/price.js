export default async function checkOnPrice(tx, price) {
    const currentPrice = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/buy')
        .then(res => res.json())
        .then(res => parseFloat(res.data.amount));
    const greaterThan = price.operator === 'greater-than';
    let conditionMet;
    
    greaterThan && (conditionMet = (currentPrice > price.value));
    !greaterThan && (conditionMet = (currentPrice < price.value));
    
    console.log({currentPrice, greaterThan, price, conditionMet});

    return conditionMet;
}