<script>
    import { websiteOwnerKeys } from '$lib/constants';
	import { selectedMessage } from '$lib/store';
    import { chatData } from '$lib/store';
    export let event;
    export let responses;

    let profiles = {};
    let profilePicture;

    function selectMessage() {
        selectedMessage.set(event.id);
    }

    const byWebsiteOwner = !!websiteOwnerKeys[event.pubkey];

    $: profiles = $chatData.profiles;
    $: displayName = profiles[event.pubkey] && profiles[event.pubkey].display_name || event.pubkey;
    $: nip05 = profiles[event.pubkey] && profiles[event.pubkey].nip05;

    $: profilePicture = profiles[event.pubkey] && profiles[event.pubkey].picture || `https://robohash.org/${event.pubkey}.png?set=set1`;

    const repliedIds = event.tags.filter(e => e[0] === 'e').map(e => e[1]);
</script>

<div
    href='#'
    class="
        block p-2-lg mb-2
        text-wrap
    "
>
    <div class="flex flex-row gap-4">
        <div class="min-w-fit">
            <img src="{profilePicture}" class="
                block w-10 h-10 rounded-full
                {byWebsiteOwner ? 'ring-purple-700 ring-4' : 'ring-gray-300 ring-2'}
            " alt="" />
        </div>

        <div class="w-full overflow-hidden">
            <div class="flex flex-row justify-between text-center overflow-clip text-clip w-full">
                <span class="text-base font-semibold text-clip">{displayName}</span>
                {#if nip05}
                    <span class="text-sm text-gray-400">{nip05}</span>
                {/if}

            </div>
            
            <div class="max-h-64 text-sm text-gray-500 bg-gray-100 p-2 overflow-scroll">
                {event.content}
            </div>

            {#if byWebsiteOwner}
                <div class="text-purple-500 text-xs">
                    Website owner
                </div>
            {/if}
        </div>        
    </div>
</div>

{#if responses[event.id].length > 0}
    <div class="pl-5 border-l border-l-gray-400 mb-10">
        {#each responses[event.id] as response}
            <svelte:self {profiles} event={response} {responses} />
        {/each}
    </div>
{/if}


<!-- <div class="flex flex-row gap-4">
    <img src="{profiles[event.pubkey].picture}" class="
        inline-block w-10 h-10 rounded-full
        {byWebsiteOwner ? 'ring-purple-700 ring-4' : ''}
    " alt="" />

    <div class="flex flex-col w-full">
        <div class="flex flex-row justify-between items-center">
            <b class="text-lg">{profiles[event.pubkey].display_name}</b>

            {#if profiles[event.pubkey].nip05}
                <span class="text-gray-500 font-sm">
                    {profiles[event.pubkey].nip05}
                </span>
            {/if}

        </div>

        {#if byWebsiteOwner}
            <div class="text-purple-700 font-sm">
                This is user is the website owner
            </div>
        {/if}
    </div>
</div> -->