<script>
    /** @type {import('./$types').PageData} */
    export let data;
    const tx = JSON.parse(data.tx);
</script>

<div class="min-h-screen flex flex-col md:flex-row items-center justify-center">

    <div class="flex flex-col items-center text-center md:text-left">
        <div class="flex flex-col md:flex-row gap-5 justify-center items-center">
            <img src="/images/paid.svg" class="w-1/2 md:w-64" />
            <div class="flex flex-col gap-4">
                <h1 class="
                    text-slate-900 dark:text-white
                    font-sans
                    text-4xl md:text-7xl
                    font-black
                    tracking-wider
                ">Transaction<br>scheduled</h1>
                <h2 class="
                    text-2xl
                    text-slate-400 dark:text-gray-600
                    tracking-wide
                ">We'll broadcast your transaction when the time is right.</h2>

                <a href="/" class="
                    w-full
                    bg-slate-900 dark:bg-purple-900
                    text-white
                    text-lg tracking-wider
                    uppercase
                    p-5
                    text-center
                ">
                    Schedule another
                </a>
            </div>
        </div>

        <!-- <div class="flex flex-row justify-center items-center w-2/3">
            <p class="text-lg mt-10 p-5
                dark:bg-dark-blue-800
                dark:text-gray-300
                rounded-lg
            ">
                Keep this URL, in the future you'll be able to use it if you want to cancel the scheduled broadcast.
            </p>
        </div> -->
    </div>    
</div>