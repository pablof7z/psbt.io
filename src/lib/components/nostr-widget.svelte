<script>
    let showChat = true;

    function toggleChat() {
        showChat = !showChat;
    }
    
</script>

<div class="fixed bottom-5 right-5 mb-5 flex flex-col item-end">

    {#if showChat}
        <div class="bg-white mb-5 w-96 max-w-screen-sm text-black rounded-xl p-5 overflow-scroll" style="max-height: 80vh;">

            
            
        </div>
    {/if}
    
    
    <div class="self-end">
        <a href="#" class="bg-purple-900 hover:bg-purple-700 w-full p-5 rounded-full flex-shrink-1 text-center font-semibold" on:click={toggleChat}>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 inline-block">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
        </a>
    </div>
</div>