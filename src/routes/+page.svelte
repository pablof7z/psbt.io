<script>
    import NavBar from '../lib/components/NavBar.svelte';
    import { createInvoice, checkInvoiceStatus, formatSatoshis, chooseRandomNumberFrom } from '$lib/utils.js';
    import { invoiceStatus } from '$lib/store.js';

    import Hero from "$lib/components/Hero.svelte";
    import ConditionalCard from "$lib/components/ConditionalCard.svelte";
    import {onMount} from 'svelte';
    import QR from 'svelte-qr';
    

    import NostrChat from "$lib/components/nostr-widget.svelte";

    let conditions = {}
    let tx;
    const possiblePrices = [1492, 1913, 1933, 1944, 1971, 2016];
    const mainnetPrice = chooseRandomNumberFrom(possiblePrices);
    let broadcastPrice = mainnetPrice;
    let invoice;
    let network;
    let paid = false;
    let checkInterval;

    $: paid = $invoiceStatus === 'paid' || network === 'testnet';

    function setTx(event, hex) {
        if (!hex) {
            hex = event.target.value;
        }
        tx = window.bitcoin.Transaction.fromHex(hex);
    }

    async function checkInvoiceForPayment() {
        const status = await checkInvoiceStatus(invoice);
        if (status.paid) {
            invoiceStatus.set('paid')
            clearInterval(checkInterval);
        }
    }

    onMount(async () => {
        invoice = await createInvoice(broadcastPrice);

        checkInterval = setInterval(checkInvoiceForPayment, 2500);

        invoiceStatus.subscribe(async (value) => {
            if (invoice && value === 'check') {
                await checkInvoiceForPayment();
            }
        });
    })

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

    function onNetworkChange(event) {
        network = event.target.value;

        if (network === "testnet") {
            broadcastPrice = 0;
        } else {
            broadcastPrice = mainnetPrice;
        }
    }

    function mempoolBaseUrl() {
        if (network === "testnet") {
            return "https://mempool.space/testnet";
        }
        return "https://mempool.space";
    }

    function setRelativeBlock(relative) {
        return (() => {
            fetch(`${mempoolBaseUrl()}/api/blocks/tip/height`)
                .then(response => response.text())
                .then(blockHeight => {
                    const relativeBlockHeight = parseInt(blockHeight) + relative;
                    const el = document.getElementById("onBlock");
                    el?.setAttribute("value", relativeBlockHeight);
                    el?.dispatchEvent(new Event('change'));
                })
        })
    }

    function switchToTestnet() {
        if (confirm("Switch to testnet?")) {
            network = "testnet";
            const el = document.getElementById("network");
            el.selectedIndex = 1;
            broadcastPrice = 0;
        }
    }
</script>

<NavBar></NavBar>

<form action="?/save" method="post">
    <input type="hidden" name="conditions" value="{JSON.stringify(conditions)}">

    <Hero />

    <div class="mx-auto max-w-4xl mt-10">
    <div class="px-5 flex flex-col 2xl:flex-col justify-center">
        <div>
            <textarea name="tx" cols="30" rows="10" placeholder="Enter your raw tx in hex format" required class="
                w-full
                bg-transparent
                border-purple-700
                resize-none
                rounded-xl md:rounded-3xl
                p-5 lg:p-10x
                border font-mono
                " on:change={setTx} style="box-shadow: 0 0px 30px 0px rgb(147 51 234 / var(--tw-text-opacity))"></textarea>

            <div class="my-3 flex flex-row items-center justify-between gap-4 w-full px-10">
                <select id="network" name="network" class="bg-black hover:bg-dark-blue-900 p-6 pr-12 hover:text-white rounded py-3 mt-1 border-gray-900 text-sm text-gray-400" on:change={onNetworkChange}>
                    <option value="bitcoin">Bitcoin</option>
                    <option value="testnet">Testnet</option>
                </select>
        
                <!-- <button class="bg-gradient-to-r from-slate-800 to-slate-900 rounded px-8 py-3 text-sm border-gray-800 border text-gray-400 hover:text-gray-300">Test broadcastability</button> -->
            </div>

            <div class="bg-dark-blue-800 my-10 h-px w-full mb-6"></div>

        </div>

        <div class="font-mono">
            <section class="">
                <h2 class="text-4xl text-gray-400 mb-5">Broadcast Settings</h2>

                <!-- <div class="
                    p-4
                    my-5
                    rounded
                    bg-red-900
                    text-white
                ">The backend is not deployed yet; you won't be able to save this.</div> -->
            
                <div class="flex flex-col md:grid grid-flow-row grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-12">

                    <ConditionalCard isEnabled={hasOnDate} onReset={unsetOnDate} title="On Date:">
                        <input type="date" class="w-full bg-transparent border-gray-900 dark:border-gray-300 resize-none border rounded my-3 p-3 font-mono" id="onDate" name="onDate" on:change={onDateSet} />
                    </ConditionalCard>

                    <ConditionalCard isEnabled={hasOnBlock} onSet={onBlockSet} onReset={unsetOnBlock} title="On Block:">
                        <input type="number" class="w-full bg-transparent border-gray-900 dark:border-gray-300 resize-none border rounded my-3 p-3 font-mono" id="onBlock" name="onBlock" on:change={onBlockSet} />
                        
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
                        <select id="priceOperator" name="priceOperator" class="mt-1 block w-full rounded-md dark:bg-slate-900 dark:border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 md:text-lg">
                            <option value="greater-than">Price is &gt;=</option>
                            <option value="less-than">Price is &lt;=</option>
                        </select>
            
                        <input placeholder="BTCUSD price" type="number" name="price" id="price" step="any" class="w-full bg-transparent border-gray-900 dark:border-gray-300 resize-none border rounded my-3 p-3 font-mono" on:change={onPriceSet}>
                    </ConditionalCard>

                    <ConditionalCard isEnabled={hasOnFeeRate} onSet={onFeeRateSet} onReset={unsetOnFeeRate} title="On avg. Fee Rate:">
                        <select id="feeRateDirection" name="feeRateDirection" class="mt-1 block w-full rounded-md dark:bg-slate-900 dark:border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 md:text-lg">
                            <option>sats/vByte is &gt;=</option>
                            <option>sats/vByte is &lt;=></option>
                        </select>

                        <input placeholder="sats per vByte (e.g. 10)" type="number" name="avgFee" step="any" class="w-full bg-transparent border-gray-900 dark:border-gray-300 resize-none border rounded my-3 p-3 font-mono" on:change={onFeeRateSet} />
                    </ConditionalCard>

                    <div class="col-span-2">
                        <ConditionalCard title="All inputs exist" isEnabled={hasAllInputsExist} onReset={unsetAllInputsExist}>
                            <label class="flex flex-row items-center gap-3">
                                <input id="" aria-describedby="comments-description" type="checkbox" class="h-6 w-6 rounded border-gray-300 dark:text-blue-900 focus:ring-blue-900 my-3" checked={hasAllInputsExist} on:change={onAllInputsExistSet}>
                                When all inputs in the transaction exist on-chain
                            </label>
                        </ConditionalCard>
                    </div>
                </div>   

                <div class="
                    flex
                    flex-col md:flex-row
                    items-center md:items-stretch
                    justify-start
                    my-10
                    gap-4 md:gap-10
                ">
                    <div class="
                        mx-auto md:mx-0
                        w-3/5 sm:2/5 md:w-2/5
                    ">
                        {#if invoice?.payment_request}
                            {#if !paid}
                                <div class="bg-white w-full md:mb-7 p-3">
                                    <QR text={invoice?.payment_request} />
                                </div>
                            {:else}
                                <img src="/images/paid.svg" class="w-full" />
                            {/if}
                        {/if}
                    </div>
                    <div class="
                        flex flex-col
                        w-full md:w-3/5
                        items-stretch justify-center
                        gap-4
                    ">
                        {#if !paid && invoice?.payment_request}
                            <div class="
                                bg-slate-100 dark:bg-slate-700
                                border border-slate-500
                                p-4 rounded-lg overflow-scroll
                            ">
                                <span>{invoice?.payment_request}</span>
                            </div>
                        {:else}
                            <div></div>
                        {/if}

                        <div class="flex-shrink flex flex-col items-center gap-2">
                            <button class="
                                border
                                border-purple-900
                                bg-dark-blue-900 dark:bg-purple-1000
                                {paid ? 'cursor-pointer' : 'cursor-not-allowed'}
                                {paid ? 'hover:bg-dark-blue-800' : ''}
                                {paid ? 'dark:hover:bg-purple-700' : ''}
                                w-full
                                lg:px-20
                                py-6 text-white tracking-widest rounded-lg
                                ">
                                <div class="flex flex-row items-center justify-center gap-4
                                    {paid ? '' : 'opacity-50'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                    </svg>
                                    
                                    <div class="flex flex-col items-start">
                                        <span class="font-semibold text-xl">SCHEDULE BROADCAST</span>
                                        <div class="">
                                            <span>⚡️</span>
                                            <span class="opacity-50 font-extralight text-sm tracking-normal">
                                                {formatSatoshis(broadcastPrice)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                            <span class="
                                text-orange-500 dark:text-yellow-500
                                font-bold dark:font-extralight
                                text-sm
                            ">
                                <a href="#" on:click|preventDefault={switchToTestnet}>[free on testnet]</a>
                            </span>
                        </div>
                    </div>
                </div>

<!-- 
                <button class="
                    my-10 w-full border
                    border-dark-blue-800 dark:border-purple-800
                    bg-dark-blue-900 dark:bg-purple-900
                    hover:bg-dark-blue-800
                    dark:hover:bg-purple-700
                    py-6 text-white flex flex-row items-center justify-center tracking-widest rounded-lg
                    gap-4
                    ">
                    <div class="w-1/2 flex flex-row justify-end">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                        
                    <div class="w-1/2 flex flex-col items-start">
                        <span class="font-semibold text-xl whitespace-nowrap">SCHEDULE BROADCAST</span>
                        <div class="">
                            <span>⚡️</span>
                            <span class="opacity-50 font-extralight text-sm tracking-normal">
                                {formatSatoshis(broadcastPrice)}
                            </span>
                        </div>
                    </div>
                </button> -->
                
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

<div class="bg-slate-50 dark:bg-transparent py-10">
    <section class="
        mx-auto max-w-2xl text-slate-700 dark:text-white
        text-justify md:text-left
        py-5 px-10 md:px-5
    ">
        <h1 class="text-4xl font-black tracking-widest mb-5">FAQ</h1>

        <h2 class="text-2xl font-semibold tracking-wide mb-2">
            How can I know this service will continue running?
        </h2>

        <p class="text-lg leading-relaxed text-gray-400 mb-3">
            Great question!
        </p>

        <p class="text-lg leading-relaxed text-gray-400 mb-3">
            You don't.
        </p>

        <p class="text-lg leading-relaxed text-gray-400 mb-3">
            What I can assure you is that
            <span class="text-slate-700 font-semibold dark:text-white">it's in my best interest</span>
            for this service to continue running. And isn't that what
            we rely on in bitcoin
            <img src="https://abs.twimg.com/hashflags/Bitcoin_evergreen/Bitcoin_evergreen.png" style="width: 1.2em; vertical-align: -20%; margin-right: 0.075em; height: 1.2em; margin-left: 2px; display: inline-block;">
            ultimately?
        </p>

        <h2 class="text-xl font-semibold tracking-wide mb-2">
            huh?
        </h2>

        <p class="text-lg leading-relaxed text-gray-400 mb-3">
            I received this question on Nostr, and I came up with an idea:
        </p>

        <p class="text-xl leading-relaxed text-slate font-semibold dark:text-white my-7">
            I'll send 1M sats to an address that becomes spendable by anyone in 1.25 years.
        </p>

        <p class="text-lg leading-relaxed text-gray-400 mb-3">
            PSBT.io has transactions scheduled to spend that UTXO to the next address in that output descriptor.
        </p>

        <p class="text-lg leading-relaxed text-slate font-semibold dark:text-white my-7">
            If this service goes down, I'll lose those funds.
        </p>

        <ul class="list-disc text-lg leading-relaxed text-gray-400 my-10 pl-5">
            <li class="mb-2">Time-locked funds for 65535 blocks (~1.25 years)</li> 
            <li class="mb-2">100-block window where psbt.io can respend the funds to the next address (resetting the timelock)</li> 
            <li class="mb-2">if psbt.io doesn't broadcast the tx, anyone can take them</li> 
        </ul>

        <p class="text-lg leading-relaxed text-gray-400 mb-3 ">
            <span class="line-through">
            <a href="#" class="
                dark:text-gray-200 dark:hover:text-white
                dark:bg-purple-1000 dark:hover:bg-purple-700
                text-gray-500  hover:text-white
                bg-slate-200 hover:bg-slate-600
                p-1 rounded-sm
            ">Here's the transaction</a>,
            where the funds are commited and the
            script can be verified.
            </span>
            <span>TODO</span>
            <!-- <a href="#" class="
                dark:text-gray-200 dark:hover:text-white
                dark:bg-purple-1000 dark:hover:bg-purple-700
                text-gray-500  hover:text-white
                bg-slate-200 hover:bg-slate-600
                p-1 rounded-sm
            " on:click|preventDefault={()=>{showScript = !showScript}}>here's the script behind it</a>
            (supplying the script to make it possible in case you want to verify that the hash of this transaction's UTXO
            matches this script 😉). -->
        </p>
    </section>
</div>


<!-- <NostrChat /> -->