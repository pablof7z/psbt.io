<script>
    import NavBar from '../lib/components/NavBar.svelte';

    import "$lib/bitcoinjs-lib.js";
    import Hero from "$lib/components/Hero.svelte";
    import ConditionalCard from "$lib/components/ConditionalCard.svelte";

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
        document.getElementById("onDate").setAttribute('value', "");
        delete conditions.onDate;
        hasOnDate = false;
    }

    function onBlockSet(event) {
        conditions.onBlock = parseInt(event.target.value);
        hasOnBlock = true;
    }

    function unsetOnBlock() {
        document.getElementById("onBlock").setAttribute('value', "");
        delete conditions.onBlock;
        hasOnBlock = false;
    }

    /**
     * @param {{ target: { value: string; }; }} event
     */
    function onPriceSet(event) {
        const priceValue = document.getElementById("price")?.value;
        const priceOperator = document.getElementById("priceOperator")?.value;
        conditions.onPrice = {
            value: parseFloat(priceValue),
            operator: priceOperator
        };
    }

    function unsetOnPrice() {
        delete conditions.onPrice;
        document.getElementById("price").setAttribute('value', "");
        hasOnPrice = false;
    }

    function onFeeRateSet(event) {
        conditions.onFeeRate = parseFloat(event.target.value);
    }

    function unsetOnFeeRate() {
        delete conditions.onFeeRate;
        document.getElementById("feeRate").setAttribute('value', "");
        hasOnFeeRate = false;
    }

    function onAllInputsExistSet(event) {
        conditions.onAllInputsExist = event.target.checked;
    }

    function unsetAllInputsExist() {
        delete conditions.onAllInputsExist;
        hasAllInputsExist = false;
    }

    let hasOnDate;
    $: hasOnDate = !!conditions.onDate;

    let hasOnBlock;
    $: hasOnBlock = !!conditions.onBlock;

    let hasOnPrice;
    $: hasOnPrice = !!conditions.onPrice;

    let hasOnFeeRate;
    $: hasOnFeeRate = !!conditions.onFeeRate;

    let hasAllInputsExist;
    $: hasAllInputsExist = !!conditions.onAllInputsExist;

    function setRelativeBlock(relative) {
        return (() => {
            fetch('https://mempool.space/api/blocks/tip/height')
                .then(response => response.text())
                .then(blockHeight => {
                    const relativeBlockHeight = parseInt(blockHeight) + relative;
                    const el = document.getElementById("onBlock");
                    el?.setAttribute("value", relativeBlockHeight);
                    el?.dispatchEvent(new Event('change'));
                })
        })
    }
</script>

<NavBar></NavBar>

<form action="?/save" method="post">
    <input type="hidden" name="conditions" value="{JSON.stringify(conditions)}">

    <Hero />

    <div class="mx-auto max-w-4xl mt-10">
    <div class="px-5 flex flex-col 2xl:flex-col justify-center">
        <div>
            <textarea name="tx" cols="30" rows="10" placeholder="Enter your raw tx in hex format" class="
                w-full
                bg-transparent
                border-purple-700
                resize-none
                rounded-xl md:rounded-3xl
                p-5 lg:p-10x
                border font-mono
                " on:change={setTx} style="box-shadow: 0 0px 30px 0px rgb(147 51 234 / var(--tw-text-opacity))"></textarea>

            <div class="my-3 flex flex-row items-center justify-between gap-4 w-full px-10">
                <select id="network" name="network" class="bg-black hover:bg-dark-blue-900 p-6 pr-12 hover:text-white rounded py-3 mt-1 border-gray-900 text-sm text-gray-400">
                    <option value="bitcoin">Bitcoin</option>
                    <option value="testnet">Testnet</option>
                </select>
        
                <button class="bg-gradient-to-r from-slate-800 to-slate-900 rounded px-8 py-3 text-sm border-gray-800 border text-gray-400 hover:text-gray-300">Test broadcastability</button>
            </div>

            <div class="bg-dark-blue-800 my-10 h-px w-full mb-6"></div>

        </div>

        <div class="font-mono">
            <section class="">
                <h2 class="text-4xl text-gray-400 mb-5">Broadcast Settings</h2>

                <div class="
                    p-4
                    my-5
                    rounded
                    bg-red-900
                    text-white
                ">The backend is not deployed yet; you won't be able to save this.</div>
            
                <div class="flex flex-col md:grid grid-flow-row grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-12">

                    <ConditionalCard isEnabled={hasOnDate} onSet={onDateSet} onReset={unsetOnDate} title="On Date:">
                        <input type="date" class="w-full bg-transparent border-gray-900 resize-none border rounded my-3 p-3 font-mono" id="onDate" name="onDate" on:change={onDateSet} />
                    </ConditionalCard>

                    <ConditionalCard isEnabled={hasOnBlock} onSet={onBlockSet} onReset={unsetOnBlock} title="On Block:">
                        <input type="number" class="w-full bg-transparent border-gray-900 resize-none border rounded my-3 p-3 font-mono" id="onBlock" name="onBlock" on:change={onBlockSet} />
                        
                        <span class="isolate inline-flex rounded-md shadow-sm items-center">
                            <span class="mr-3">In</span>
                            <button type="button" class="relative inline-flex items-center rounded-l-md border border-purple-900 bg-purple-1000 px-4 py-2 text-sm font-medium text-purple-200
                            hover:bg-purple-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" on:click={setRelativeBlock(1)}>
                                1
                            </button>
                            <button type="button" class="relative -ml-px inline-flex items-center border border-purple-900 bg-purple-1000 px-4 py-2 text-sm font-medium text-purple-200
                            hover:bg-purple-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" on:click={setRelativeBlock(5)}>
                                5
                            </button>
                            <button type="button" class="relative -ml-px inline-flex items-center rounded-r-md border border-purple-900 bg-purple-1000 px-4 py-2 text-sm font-medium text-purple-200
                            hover:bg-purple-900 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500" on:click={setRelativeBlock(100)}>
                                100
                            </button>
                            <span class="ml-3">blocks</span>
                          </span>
                          
                    </ConditionalCard>


                    <ConditionalCard isEnabled={hasOnPrice} onSet={onPriceSet} onReset={unsetOnPrice} title="On Price:">
                        <select id="priceOperator" name="priceOperator" class="mt-1 block w-full rounded-md dark:bg-slate-900 dark:border-gray-900 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 md:text-lg">
                            <option value="greater-than">Price is &gt;=</option>
                            <option value="less-than">Price is &lt;=</option>
                        </select>
            
                        <input placeholder="BTCUSD price" type="number" name="price" id="price" step="any" class="w-full bg-transparent border-gray-900 resize-none border rounded my-3 p-3 font-mono" on:change={onPriceSet}>
                    </ConditionalCard>

                    <ConditionalCard isEnabled={hasOnFeeRate} onSet={onFeeRateSet} onReset={unsetOnFeeRate} title="On avg. Fee Rate:">
                        <select id="feeRateDirection" name="feeRateDirection" class="mt-1 block w-full rounded-md dark:bg-slate-900 dark:border-gray-900 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 md:text-lg">
                            <option>sats/vByte is &gt;=</option>
                            <option>sats/vByte is &lt;=></option>
                        </select>

                        <input placeholder="sats per vByte (e.g. 10)" type="number" name="avgFee" step="any" class="w-full bg-transparent border-gray-900 resize-none border rounded my-3 p-3 font-mono" on:change={onFeeRateSet} />
                    </ConditionalCard>

                    <div class="col-span-2">
                        <ConditionalCard title="All inputs exist" isEnabled={hasAllInputsExist} onReset={unsetAllInputsExist}>
                            <label class="flex flex-row items-center gap-3">
                                <input id="" aria-describedby="comments-description" type="checkbox" class="h-6 w-6 rounded border-gray-300 dark:text-blue-900 focus:ring-blue-900 my-3" checked={hasAllInputsExist} on:change={onAllInputsExistSet}>
                                When all inputs on the transaction exist on-chain
                            </label>
                        </ConditionalCard>
                    </div>
                </div>   

                <button class="
                    my-10 w-full border
                    border-dark-blue-800 dark:border-purple-800
                    bg-dark-blue-900 dark:bg-purple-900
                    hover:bg-dark-blue-800
                    dark:hover:bg-purple-700
                    p-6 text-white flex flex-row items-center justify-center gap-4 font-semibold text-xl tracking-widest rounded-lg
                    ">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                      </svg>
                      
                    SAVE
                </button>
                
            </section>
        </div>
    </div>
    </div>

<div class="md:p-8 grid grid-flow-row grid-cols-1 lg:grid-cols-2 items-start justify-center gap-4">
    

    {#if tx}
        <h3 class="dark:text-white text-3xl font-serif mt-5">Transaction details</h3>
        <div class="bg-gradient-to-r from-white h-px w-full mb-6"></div>
        
        <div class="text-gray-400">
            <h4 class="text-gray-200 text-xl font-bold my-5">Outputs</h4>

            <ul class="font-mono">
                {#each tx.outs as out}
                    <li>
                        <b>{window.bitcoin.address.fromOutputScript(out.script, window.bitcoin.networks.bitcoin)}:</b>
                        {formatSatoshis(parseInt(out.value))}
                    </li>
                {/each}
            </ul>
        </div>
    {/if}


    
</div>

</form>




<!-- <NostrChat /> -->