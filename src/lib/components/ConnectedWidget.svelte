<script>
    import { chatAdapter, chatData, selectedMessage } from '$lib/store';
    import { onMount } from 'svelte';
    import NostrNote from './NostrNote.svelte';
    import { websiteOwnerKeys } from '$lib/constants';

    async function sendMessage() {
        const input = document.getElementById('message-input');
        const message = input.value;
        input.value = '';
        let extraParams = {};

        // if this is the rootLevel we want to tag the owner of the site's pubkey
        if (!rootNoteId) { extraParams.tagPubKeys = websiteOwnerKeys }

        if (rootNoteId) {
            // mark it as a response to the most recent event
            const mostRecentEvent = events[events.length - 1];
            extraParams.tags = []
            // go through all the tags and add them to the new message
            if (mostRecentEvent) {
                mostRecentEvent.tags.forEach(tag => {
                    if (tag[0] === 'e') {
                        extraParams.tags.push(tag);
                    }
                })
                extraParams.tags.push(['e', mostRecentEvent.id]);
                extraParams.tags.push(['p', mostRecentEvent.pubkey]);
            }
        }
        
        const noteId = await $chatAdapter.send(message, extraParams);

        if (!rootNoteId) {
            rootNoteId = noteId;
            localStorage.setItem('rootNoteId', rootNoteId);
        }
    }
    
    async function inputKeyDown(event) {
        if (event.key === 'Enter') {
            sendMessage();
            event.preventDefault();
        }
    }

    function messageReceived(message) {
        const messageLastEventTag = message.tags.filter(tag => tag[0] === 'e').pop();
        const pubkeysTagged = message.tags.filter(tag => tag[0] === 'p').map(tag => tag[1]);
        const isThread = new Set(pubkeysTagged).size >= 2;

        responses[message.id] = [];

        if (isThread) {
            const lastETag = message.tags.filter(tag => tag[0] === 'e').pop();
            if (lastETag && lastETag[1] && responses[lastETag[1]]) {
                responses[lastETag[1]].push(message);
            }
            
            responses = responses;
        } else {
            // insert message so that it's chronologically ordered by created_at
            let index = 0;
            while (index < events.length && events[index].created_at < message.created_at) {
                index++;
            }
            events.splice(index, 0, message);
            responses = responses;
            events = events;
        }
    }

    function reactionReceived(reaction) {
        const event = events.find(event => event.id === reaction.id);
        if (!event) { return; }

        event.reactions = event.reactions || [];
        event.reactions.push(reaction);
        events = events;
    }

    let rootNoteId;
    
    onMount(() => {
        console.log('onMount');
        // check if there's a root note saved on the localstorage
        // if there is, load it
        rootNoteId = localStorage.getItem('rootNoteId');
        if (rootNoteId) {
            $chatAdapter.subscribeToEventAndResponses(rootNoteId);
        }

        // $chatAdapter.subscribe({
        //     kinds: [1],
        //     '#r': ['https://psbt.io']
        // }, messageReceived);

        $chatAdapter.on('message', messageReceived);

        $chatAdapter.on('reaction', reactionReceived);

        $chatAdapter.on('profile', ({pubkey, profile}) => {
            let profiles = $chatData.profiles;
            profiles[pubkey] = profile;

            chatData.set({ profiles, ...$chatData })
        })
    });

    let events = [];
    let responses = {};
    let profiles = {};

    $: profiles = $chatData.profiles;
</script>

<div class="aoverflow-scroll">
    {#each events as event}
        <NostrNote {event} {responses} />
    {/each}
</div>


<div class="flex flex-row gap-2">
    <textarea
        type="text"
        id="message-input"
        class="
            p-2
            w-full
            resize-none
            rounded-xl
            text-gray-600
        " placeholder="Say hello!"
        rows=1
        on:keydown={inputKeyDown}
    ></textarea>
    <button type="button" class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 p-3 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" on:click|preventDefault={sendMessage}>
        <!-- Heroicon name: outline/plus -->
        <svg aria-hidden="true" class="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
      </button>
      
</div>