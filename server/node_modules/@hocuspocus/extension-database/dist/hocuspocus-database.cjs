'use strict';

var Y = require('yjs');

function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
        Object.keys(e).forEach(function (k) {
            if (k !== 'default') {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () { return e[k]; }
                });
            }
        });
    }
    n.default = e;
    return Object.freeze(n);
}

var Y__namespace = /*#__PURE__*/_interopNamespaceDefault(Y);

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
            Y__namespace.applyUpdate(data.document, update);
        }
    }
    /**
     * Store new updates in the database.
     */
    async onStoreDocument(data) {
        await this.configuration.store({
            ...data,
            state: Buffer.from(Y__namespace.encodeStateAsUpdate(data.document)),
        });
    }
}

exports.Database = Database;
//# sourceMappingURL=hocuspocus-database.cjs.map
