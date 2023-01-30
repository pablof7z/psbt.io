import { sequelize, Transaction } from '../src/lib/server/db.js'
import { Sequelize } from 'sequelize'
const {Op} = Sequelize;

const txs = await Transaction.findAll({where:{broadcasted: {[Op.ne]: true}}});

console.log(txs.length);

for (let tx of txs) {
    if (await satisfiesAllConditions(tx)) {
        console.log(`kosher to broadcast ${tx.id}`);
    }
}

async function satisfiesAllConditions(tx) {
    const passesOnDate = (!tx.conditions.onDate || await checkOnDate(tx, tx.conditions.onDate));
    const passesOnBlock = (!tx.conditions.onBlock || await checkOnBlock(tx, tx.conditions.onBlock));
    const passesOnPrice = (!tx.conditions.onPrice || await checkOnPrice(tx, tx.conditions.onPrice));

    console.log({passesOnDate, passesOnBlock, passesOnPrice});
}

async function checkOnDate(tx, date) {
    date = new Date(date)

    console.log({date});

    return date < new Date();
}

async function checkOnBlock(tx, blockHeight) {
    console.log({blockHeight});
}

async function checkOnPrice(tx, price) {
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