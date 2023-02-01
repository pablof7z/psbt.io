import { sequelize, Transaction } from '$lib/server/db'

/** @type {import('./$types').PageServerLoad} */
export async function load({ params}) {
    const { id } = params;
    const tx = await Transaction.findOne({where: {id}});

    return {tx: JSON.stringify(tx)};
};