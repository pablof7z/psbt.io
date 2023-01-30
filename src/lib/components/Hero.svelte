<script>
    import HeroFeature from "./HeroFeature.svelte";
</script>

<div class="flex
    flex-col lg:flex-row
    items-center justify-center
    2xl:max-w-screen-2xl
    2xl:mx-auto" style="min-height: 70vh;">
    <div class="
        md:px-4
        mb-10
        lg:mb-0
        lg:w-3/5
        ">
        <p class="
            px-8 md:px-0
            text-4xl md:text-7xl lg:text-5xl xl:text-7xl 2xl:text-8xl
            text-purple-600 font-sans tracking-wider uppercase font-black">
            <span class="text-purple-300">IFTTT</span>
            of bitcoin
            <img src="https://abs.twimg.com/hashflags/Bitcoin_evergreen/Bitcoin_evergreen.png" style="width: 1.2em; vertical-align: -20%; margin-right: 0.075em; height: 1.2em; margin-left: 2px; display: inline-block;">
            transaction broadcasting
        </p>

        <p class="px-8 md:px-0 text-2xl mt-5 text-gray-600 font-sans font-extralight">
            Send bitcoin tansactions when certain conditions have been met.
        </p>
    </div>

    <div class="
        w-full
        lg:w-2/5 flex flex-col
        md:px-4
        ">
        <h3 class="
            font-semibold uppercase text-purple-700 text-lg
            px-8 md:px-0
        ">
            Example use-cases
        </h3>
        <div class="flex flex-col md:gap-4 md:flex-row lg:flex-col xl:my-0">
            
            <HeroFeature>
                Spend a tx with an absolute timelock that spends your cold storage to a known address in case of complete loss of keys.
            </HeroFeature>

            <HeroFeature>
                Automatically add collateral to a bitcoin-backed loan if the price drops to a certain level.
            </HeroFeature>
        </div>
    </div>
</div>