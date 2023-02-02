import NstrAdapter from './index.js';

class NstrAdapterExtension extends NstrAdapter {
    constructor(pubkey) {
        super(pubkey);
    }

    async signEvent(event) {
        return await window.nostr.signEvent(event);
    }
}

export default NstrAdapterExtension;
