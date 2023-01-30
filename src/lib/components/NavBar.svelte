<script>
    import "$lib/bitcoinjs-lib.js";
    import Hero from "$lib/components/Hero.svelte";
    import { onMount } from "svelte";

    import NostrChat from "$lib/components/nostr-widget.svelte";

    let conditions = {}
    let tx;
    
    function setTx(event, hex) {
        if (!hex) {
            hex = event.target.value;
        }
        tx = window.bitcoin.Transaction.fromHex(hex);
    }

    // onMount(() => {
    //     setTx(null, '02000000000101b18043e72d0100826bf56e647b2caf8c58d98d6b875feafdd4e228fe571a319d0400000000fdffffff0240d909000000000017a9141108153fd419424cc9cc5c934dc3dc5b9fe16313874268050000000000220020852caf0f48f292642943459fc92121b9814f644dc95966601dc7325e1e7fa93a0400483045022100c4f3be667cf8da9c3670d11caa4020fb248ca7c0ef5b1f08936bef54a07bf67b022029fb6db30f42dcbabcd27b22019297e3d8383b0c0de9203c7b06ec2b68ab089e0147304402203e2fb3f815a11bce2ef4550ffcb8b9a5d80806b0bffe97618ff47be9d688b61302205bfa869ced370c630652d328fdddca977c3ac9cbb6f488cdacb2e345506d28220169522102f362c3c84e064a706d03d94cbc9fb4ff4f4fac1ac2fe2921c9cb513004cea1662103523c13243c1c02c2af4e37376dada278d5a7dc84710d910ab1fc9db14fcce2c72103cc0bf9b60f0d993a3ddbbf60d59d7252c83c73e963890271a1c8e428cf909ccc53aeddcd0b00');
    // });

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

        // if v has more than two spaces, turn the first one into a comma
        // if (v.indexOf(" ") > -1) {
        //     v = v.replace(" ", ",");
        // }

        return `${v}${tryThousands?'k':''} sats`;
    }

    function onDateSet(event) {
        let date = new Date(event.target.value);
        conditions.onDate = date;
    }

    function unsetOnDate() {
        document.getElementById("onDate").value = "";
        delete conditions.onDate;
        hasOnDate = false;
    }

    function onBlockSet(event) {
        conditions.onBlock = parseInt(event.target.value);;
    }

    function unsetOnBlock() {
        document.getElementById("onBlock").value = "";
        delete conditions.onBlock;
        hasOnBlock = false;
    }

    let hasOnDate;
    $: hasOnDate = !!conditions.onDate || true;

    let hasOnBlock;
    $: hasOnBlock = !!conditions.onBlock;

    let hasOnPrice;
    $: hasOnPrice = !!conditions.onPrice;

    let hasOnFeeRate;
    $: hasOnFeeRate = !!conditions.onFeeRate;
</script>

<div class="mx-auto max-w-4xl p-5">
    <div class="flex flex-row items-center justify-between">
        <h1 class="text-4xl font-black mb-3 tracking-wider">PSBT<span class="text-purple-700" style="letter-spacing: 4px;">.io</span></h1>
        <div class="flex flex-row gap-2">
            <img src="https://styleguide.torproject.org/static/images/tor-browser/glyph/glyph.svg" class="w-6" />
            <a href="#" class="font-mono" on:click={()=>{alert('not ready yet')}}>TOR Site</a>
        </div>
    </div>
</div>

