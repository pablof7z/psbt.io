<script>
    import { onMount } from "svelte";
    import QR from 'svelte-qr';
    import { chatAdapter } from '$lib/store';
    import NstrAdapterExtension from '$lib/components/nstrchat/adapters/extension.js';
    import NstrAdapterNostrConnect from '$lib/components/nstrchat/adapters/nostr-connect.js';

    let hasNostrExtension = false;
    let publicKey = null;
    let nostrConnectURI;

    onMount(() => {
        hasNostrExtension = true;//!!window.nostr;

        const type = localStorage.getItem('nostrichat-type');

        if (type === 'extension') {
            useExtension();
        } else if (type === 'nostr-connect') {
            useNostrConnect();
        }
    });

    function useExtension() {
        window.nostr.getPublicKey().then((pubkey) => {
            localStorage.setItem('nostrichat-type', 'extension');
            chatAdapter.set(new NstrAdapterExtension(pubkey))
        });
    }

    import { generatePrivateKey, getPublicKey } from 'nostr-tools';
    import { Connect, ConnectURI } from '@nostr-connect/connect';

    async function useNostrConnect() {
        let key = localStorage.getItem('nostrichat-nostr-connect-key');
        let publicKey = localStorage.getItem('nostrichat-nostr-connect-public-key');

        if (key) {
            chatAdapter.set(new NstrAdapterNostrConnect(publicKey, key))
            return;
        }

        key = generatePrivateKey();

        const connect = new Connect({ secretKey: key, relay: 'wss://nostr.vulpem.com' });
        connect.events.on('connect', (connectedPubKey) => {
            localStorage.setItem('nostrichat-nostr-connect-key', key);
            localStorage.setItem('nostrichat-nostr-connect-public-key', connectedPubKey);
            localStorage.setItem('nostrichat-type', 'nostr-connect');
            
            console.log('connected to nostr connect relay')
            publicKey = connectedPubKey;
            chatAdapter.set(new NstrAdapterNostrConnect(publicKey, key))
            nostrConnectURI = null;
        });
        connect.events.on('disconnect', () => {
            console.log('disconnected from nostr connect relay')
        })
        await connect.init();

        const connectURI = new ConnectURI({
            target: getPublicKey(key),
            relay: 'wss://nostr.vulpem.com',
            metadata: {
                name: 'PSBT.io',
                description: '🔉🔉🔉',
                url: 'https://psbt.io',
                icons: ['https://example.com/icon.png'],
            },
        });

        nostrConnectURI = connectURI.toString();
    }

    function nostrConnectCopy() {
        navigator.clipboard.writeText(nostrConnectURI);
    }
</script>

<h1 class="font-bold text-xl mb-3">
    How would you like to connect?
</h1>

{#if publicKey}
    <p class="text-gray-400 mb-3 font-bold">
        Nostr Connect is a WIP, not fully implemented yet!
    </p>

    <p class="text-gray-400 mb-3">
        You are currently connected with the following public key:
        <span>{publicKey}</span>
    </p>
{/if}

{#if nostrConnectURI}
    <p class="text-gray-600 mb-3">
        Scan this with your Nostr Connect (click to copy to clipboard)
    </p>

    <div class="bg-white w-full p-3"
        on:click|preventDefault={nostrConnectCopy}>
        <QR text={nostrConnectURI} />
    </div>

    <button class="
        bg-purple-900
        hover:bg-purple-700
        w-full
        p-2
        rounded-xl
        text-center
        font-regular
        text-white
    " on:click|preventDefault={() => { nostrConnectURI = null; }}>
        Cancel
    </button>
{:else if !publicKey}
    <div class="flex flex-col gap-1">
        {#if hasNostrExtension}
            <button class="
                bg-purple-900
                hover:bg-purple-700
                w-full
                p-4
                rounded-xl
                text-center
                font-regular
                text-gray-200
            " on:click|preventDefault={useExtension}>
                Browser Extension
            </button>
        {/if}


        <button class="
            bg-purple-900
            hover:bg-purple-700
            w-full
            p-4
            rounded-xl
            text-center
            font-regular
            text-gray-200
        " on:click|preventDefault={useNostrConnect}>
            Nostr Connect
        </button>

        <button class="
            cursor-not-allowed
            bg-gray-400
            hover:bg-purple-700
            w-full
            p-4
            rounded-xl
            text-center
            font-regular
            text-gray-900
        ">
            Discardable Identity
            <span class="text-xs text-gray-700">
                (Generate keys)
            </span>
        </button>
    </div>
{/if}