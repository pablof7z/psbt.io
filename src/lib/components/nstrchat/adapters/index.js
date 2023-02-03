import { chatData } from '$lib/store';
import { getEventHash, relayInit } from 'nostr-tools';
import { createEventDispatcher } from 'svelte';
import EventEmitter from 'events';

class NstrAdapter {
    #subscriptionQueue = [];
    #sendQueue = [];
    #relayConnected = false;
    #relay = null;
    #profiles = {};
    #messages = {};
    #eventEmitter = new EventEmitter();

    constructor(pubkey) {
        this.pubkey = pubkey;
        this.#connect()
    }

    async getPubKey() {
        return this.pubkey;
    }

    on(event, callback) {
        this.#eventEmitter.on(event, callback);
    }

    /**
     * Send a message to the relay
     * @param {String} message - The message to send
     */
    async send(message, {tagPubKeys, tags} = {}) {
        if (!tags) { tags = []}
        let event = {
            kind: 1,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ['r', 'https://psbt.io' ],
                ...tags,
            ],
            content: message,
            pubkey: this.pubkey,
        }

        if (tagPubKeys) {
            for (let [pubkey, relay] of Object.entries(tagPubKeys)) {
                event.tags.push(['p', pubkey, relay]);
            }
        }

        event.id = getEventHash(event)
        const signedEvent = await this.signEvent(event)
        this.subscribeToEventAndResponses(signedEvent.id);

        if (this.#relayConnected) {
            this.#_publish(signedEvent);
        } else {
            this.#sendQueue.push(signedEvent);
        }

        return event.id;
    }

    async #_publish(event) {
        this.#relay.publish(event);
    }

    async storeProfile(event) {
        this.#profiles[event.pubkey] = JSON.parse(event.content);

        const dispatch = createEventDispatcher();
        dispatch('post', signedEvent.id);
    }

    async onEvent(event, messageCallback) {
        console.log('request author profile', event.pubkey);
        if (!this.#profiles[event.pubkey]) {
            this.#profiles[event.pubkey] = true;
            this.subscribe({ kinds:[0], authors:[event.pubkey]}, (e) => {
                let profile;
                try {
                    profile = JSON.parse(e.content);
                } catch (e) {
                    console.log('failed to parse profile', e);
                    return;
                }
                this.#eventEmitter.emit('profile', {pubkey: event.pubkey, profile});
            })
        }
        
        messageCallback(event)
    }

    async subscribe(filters, messageCallback) {
        if (this.#relayConnected) {
            this.#_subscribe(filters, messageCallback)
        } else {
            this.#subscriptionQueue.push({filters, messageCallback})
        }
    }

    async #_subscribe(filters, messageCallback) {
        // if filters is not an array, put it in one
        if (!Array.isArray(filters)) { filters = [filters] }
        // console.trace('subscribing to', filters);
        let sub = this.#relay.sub(filters)
        sub.on('event', (e) => this.onEvent(e, messageCallback));
    }

    #emitMessage(event) {
        if (this.#messages[event.id]) {
            return;
        }

        this.#messages[event.id] = true;

        switch (event.kind) {
            case 1: this.#eventEmitter.emit('message', event); break;
            case 7: this.#eventEmitter.emit('reaction', event); break;
            default:
                alert('unknown event kind ' + event.kind)
                console.log('unknown event kind', event.kind, event);
        }
        
    }

    subscribeToEventAndResponses(eventId) {
        this.subscribe([
            {ids: [eventId]},
            {'#e': [eventId]},
        ], (e) => {
            this.#emitMessage(e);
            // this.subscribeToResponses(e)
        })
    }
    
    subscribeToResponses(event) {
        this.subscribe([
            {'#e': [event.id]},
        ], (e) => {
            this.#emitMessage(e);
            this.subscribeToResponses(e)
        })
    }
    
    /**
     * Connect to the relay
     */
    #connect() {
        this.#relay = relayInit('wss://relay.f7z.io')
        this.#relay.connect()
        this.#relay.on('connect', () => {
            console.log(`connected to ${this.#relay.url}`, new Date())
            this.#setRelayConnected()
        })

        this.#relay.on('error', (r) => {
            console.log('error from relay', r)
            setTimeout(() => {
                this.#relay.connect()
            }, 2500);
        })

        this.#relay.on('notice', (r) => {
            console.log(r)
        })

        this.#relay.on('disconnect', (r) => {
            console.log('disconnected ' + new Date())
            setTimeout(() => {
                this.#relay.connect()
            }, 1000);
        })
    }

    async #setRelayConnected() {
        this.#relayConnected = true;
        this.#subscriptionQueue.forEach(subscription => {
            this.#_subscribe(subscription.filters, subscription.messageCallback)
        })
        this.#sendQueue.forEach(event => {
            this.#_publish(event)
        })
    }
}

export default NstrAdapter;