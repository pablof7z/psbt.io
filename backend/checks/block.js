import { getEsploraUrl } from "../utils.js";

export default async function checkOnBlock(tx, blockHeight) {
    const currentBlockHeight = await fetch(`${getEsploraUrl(tx)}/blocks/tip/height`).then(res => res.text()).then(res => parseInt(res));
    return true;
    
    return currentBlockHeight >= blockHeight;
}