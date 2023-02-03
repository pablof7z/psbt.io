import NstrAdapter from './index.js';
import { Connect } from '@nostr-connect/connect';

class NstrAdapterNostrConnect extends NstrAdapter {
    #secretKey = null;
    
    constructor(pubkey, secretKey) {
        super(pubkey);
        this.#secretKey = secretKey;
    }

    async signEvent(event) {
        const connect = new Connect({
            secretKey: this.#secretKey,
            target: this.pubkey,
        });
        await connect.init();
        
        event.sig = await connect.signEvent(event);
        return event;
    }
}

export default NstrAdapterNostrConnect;
