import { invoiceStatus } from '../lib/store.js';

export async function load({ fetch, params }) {
    fetch('https://lnbits.f7z.io/api/v1/payments/sse', {
            method: 'GET',
            headers: {
                'x-api-key': 'a0ec9bbe324041ad9f25260f153faf41'
            }
        }).then(response => {
            const reader = response.body.getReader();
            return new ReadableStream({
                start(controller) {
                    invoiceStatus.set('check')
                }
            });
        })
        .catch((err) => {
            console.log('err', err);
        }
    );
}