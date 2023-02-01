import { sequelize, Transaction } from '$lib/server/db'
import { redirect } from '@sveltejs/kit';

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

        throw redirect(301, `/${tx.id}`);
    }
};