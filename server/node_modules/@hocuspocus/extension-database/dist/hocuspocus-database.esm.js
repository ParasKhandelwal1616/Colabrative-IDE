import * as Y from 'yjs';

class Database {
    /**
     * Constructor
     */
    constructor(configuration) {
        /**
         * Default configuration
         */
        this.configuration = {
            fetch: async () => null,
            store: async () => { },
        };
        this.configuration = {
            ...this.configuration,
            ...configuration,
        };
    }
    /**
     * Get stored data from the database.
     */
    async onLoadDocument(data) {
        const update = await this.configuration.fetch(data);
        if (update) {
            Y.applyUpdate(data.document, update);
        }
    }
    /**
     * Store new updates in the database.
     */
    async onStoreDocument(data) {
        await this.configuration.store({
            ...data,
            state: Buffer.from(Y.encodeStateAsUpdate(data.document)),
        });
    }
}

export { Database };
//# sourceMappingURL=hocuspocus-database.esm.js.map
