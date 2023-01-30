import { sequelize, Transaction } from '$lib/server/db'

/** @type {import('./$types').Actions} */
export const actions = {
    save: async ({ cookies, request}) => {
        const data = await request.formData();
        const rawTx = data.get('tx');
        const network = data.get('network');
        let conditions = data.get('conditions');
        conditions = JSON.parse(conditions);

        const tx = await Transaction.create({
            rawtx: rawTx,
            network,
            conditions
        });

        console.log(tx);

        return JSON.stringify(tx);
    }
};