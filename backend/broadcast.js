import { getEsploraUrl } from "./utils.js";

export default async function broadcastTx(tx) {
    const res = await fetch(`${getEsploraUrl(tx)}/tx`, {
        method: 'POST',
        body: tx.rawtx
    });
    const {txid} = await res.json();
    console.log({txid});
    return txid;
}