import { sequelize, Transaction } from '../src/lib/server/db.js'
import { Sequelize } from 'sequelize'
import checkOnDate from './checks/date.js';
import checkOnBlock from './checks/block.js';
import checkOnPrice from './checks/price.js';

import broadcastTx from './broadcast.js';

const {Op} = Sequelize;

const txs = await Transaction.findAll({where:{network: 'testnet', broadcasted: {[Op.ne]: true}}});

console.log(txs.length);

for (let tx of txs) {
    if (await satisfiesAllConditions(tx)) {
        console.log('broadcasting tx', tx.id);
        const broadcastState = await broadcastTx(tx);
        console.log({broadcastState});
    }
}

async function satisfiesAllConditions(tx) {
    const passesOnDate = (!tx.conditions.onDate || await checkOnDate(tx, tx.conditions.onDate));
    const passesOnBlock = (!tx.conditions.onBlock || await checkOnBlock(tx, tx.conditions.onBlock));
    const passesOnPrice = (!tx.conditions.onPrice || await checkOnPrice(tx, tx.conditions.onPrice));

    console.log({passesOnDate, passesOnBlock, passesOnPrice});

    return passesOnDate && passesOnBlock && passesOnPrice;
}

