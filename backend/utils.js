export function getEsploraUrl(tx) {
    if (tx.network === 'testnet') {
        return 'https://blockstream.info/testnet/api';
    }

    return 'https://blockstream.info/api';
}