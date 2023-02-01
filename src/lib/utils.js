import LNBits from 'lnbits'; // using import

function getWallet () {
    return LNBits({
        adminKey: "",
        invoiceReadKey: 'a0ec9bbe324041ad9f25260f153faf41',
        endpoint: 'https://lnbits.f7z.io'
    });

}

export async function createInvoice(amount) {
    const { wallet, userManager, paywall, withdraw, paylink, tpos } = getWallet();

    const newInvoice = await wallet.createInvoice({
        amount: amount,
        memo: 'psbt.io',
        out: false,
    });

    return newInvoice;
}

export async function checkInvoiceStatus(invoice) {
    const { wallet, userManager, paywall, withdraw, paylink, tpos } = getWallet();
    const invoiceStatus = await wallet.checkInvoice({
        payment_hash: invoice.payment_hash,
    });

    return invoiceStatus;
}

export function formatSatoshis(sats, {tryThousands} = {}) {
    if (sats >= 1000000) {
        if (sats % 100000000 === 0) {
            return (sats / 100000000) + " BTC";
        }
        return (sats / 100000000).toFixed(2) + " BTC";
    }

    if (tryThousands && sats >= 1000) {
        sats = sats/1000;
    }
    
    let v = sats.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    if (v.indexOf(" ") > -1) {
        v = v.replace(" ", ",");
    }

    return `${v}${tryThousands?'k':''} sats`;
}

export function chooseRandomNumberFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}