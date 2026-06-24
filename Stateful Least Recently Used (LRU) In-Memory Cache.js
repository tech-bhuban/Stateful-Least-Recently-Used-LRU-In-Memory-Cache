
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

class HighPerformanceLRUCache {
    constructor(capacityLimit = 4) {
        this.capacityLimit = capacityLimit;
        this.cache = new Map(); // Native maps maintain entry insertion ordering lists
    }

    get(key) {
        if (!this.cache.has(key)) return null;

        // Shift priority pointer to the back by deleting and inserting again
        const cachedPayload = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, cachedPayload);
        return cachedPayload;
    }

    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacityLimit) {
            // Evict the least recently used element (the first entry in the Map iterator)
            const oldestReferenceKey = this.cache.keys().next().value;
            console.warn(`🚨 [Eviction] Threshold limits crossed. Pruning oldest key record: ${oldestReferenceKey}`);
            this.cache.delete(oldestReferenceKey);
        }
        this.cache.set(key, value);
    }
}

const operationalCache = new HighPerformanceLRUCache(4);
app.use(express.json());

app.post('/api/cache', (req, res) => {
    const { identifier, data } = req.body;
    operationalCache.set(identifier, data);
    res.status(201).json({ allocationState: 'mapped', identifier });
});

app.get('/api/cache/:id', (req, res) => {
    const asset = operationalCache.get(req.params.id);
    res.setHeader('X-Cache-Lookup', asset ? 'HIT' : 'MISS');
    return asset ? res.json({ target: asset }) : res.status(404).json({ error: 'Asset Expired' });
});

app.listen(PORT, () => console.log(`🚀 Cache Engine running on port ${PORT}`));


// # ⚡ Stateful Least Recently Used (LRU) Cache Engine

// A programmatic implementation of an LRU eviction cache. This engine handles high-frequency data reads and writes within strict memory parameters to prevent out-of-memory crashes.

// ## 🛠 Advanced Features
// - **Map-Iterator Eviction**: Uses native Map object pointer orders to clear old parameters in $O(1)$ time.
// - **Dynamic Re-ordering Actions**: Refreshes cache hit timelines automatically on every data read query.

// ## 🚀 Quick Start
// 1. `npm install express`
// 2. `node server.js`
