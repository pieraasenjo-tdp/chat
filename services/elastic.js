const {
    Client
} = require('@elastic/elasticsearch');

const client = new Client({
    node: 'http://localhost:9200',
});

module.exports = {
    elastic: client,
    addDocumentToElastic: async (payload) => {
        try {
            return await client.index({
                index: '', // Your Index Here
                body: payload,
            });
        } catch (error) {
            throw new Error(`Failed to index document ${error.toString()}`);
        }
    },
    searchDocumentElastic: async (query) => {
        try {
            const result = await client.search({
                index: '',
                body: {
                    query: {
                        multi_match: {
                            query,
                            fields: ['title', 'body', 'category'], // Search category *CHANGE THIS*
                            fuzziness: 1,
                        },
                    },
                },
            });
            if (result.statusCode === 200) {
                return result.body.hits.hits;
            }
            throw new Error('Search went doouuuwnn..');
        } catch (error) {
            throw new Error(error);
        }
    },
};