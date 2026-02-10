/**
 * Storage Manager for Movie Challenge
 * Handles all localStorage persistence with batched writes
 */

const StorageManager = (function () {
    const STORAGE_KEY = 'movie_challenge_progress';
    const SAVE_DEBOUNCE_MS = 500;

    let saveTimeout = null;
    let pendingState = null;

    /**
     * Default state structure
     */
    const defaultState = {
        currentIndex: 0,
        seen: [],           // Array of movie IDs marked as seen
        notSeen: [],        // Array of movie IDs marked as not seen
        history: [],        // Last N actions for undo (stores {id, action} objects)
        lastUpdated: null,
        version: 1
    };

    /**
     * Load state from localStorage
     * @returns {Object} The saved state or default state
     */
    function load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) {
                return { ...defaultState };
            }

            const parsed = JSON.parse(saved);

            // Migrate old versions if needed
            if (!parsed.version) {
                parsed.version = 1;
                parsed.history = parsed.history || [];
            }

            return {
                ...defaultState,
                ...parsed
            };
        } catch (error) {
            console.error('Failed to load progress from localStorage:', error);
            return { ...defaultState };
        }
    }

    /**
     * Save state to localStorage (debounced)
     * @param {Object} state - The state to save
     */
    function save(state) {
        pendingState = {
            ...state,
            lastUpdated: new Date().toISOString()
        };

        // Debounce writes to avoid blocking main thread
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }

        saveTimeout = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingState));
                pendingState = null;
            } catch (error) {
                console.error('Failed to save progress to localStorage:', error);

                // Handle quota exceeded
                if (error.name === 'QuotaExceededError') {
                    // Trim history to make room
                    pendingState.history = pendingState.history.slice(-50);
                    try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingState));
                    } catch (e) {
                        console.error('Still cannot save after trimming history:', e);
                    }
                }
            }
        }, SAVE_DEBOUNCE_MS);
    }

    /**
     * Force immediate save (for before page unload)
     */
    function saveImmediate(state) {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = null;
        }

        const finalState = state || pendingState;
        if (finalState) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    ...finalState,
                    lastUpdated: new Date().toISOString()
                }));
            } catch (error) {
                console.error('Failed to save on unload:', error);
            }
        }
    }

    /**
     * Reset all progress
     */
    function reset() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to reset progress:', error);
        }
        return { ...defaultState };
    }

    /**
     * Get statistics from current state
     * @param {Object} state
     * @returns {Object} Statistics
     */
    function getStats(state) {
        const total = state.seen.length + state.notSeen.length;
        const seenCount = state.seen.length;
        const totalMovies = (typeof MOVIES !== 'undefined') ? MOVIES.length : total;
        const percentComplete = total > 0 ? Math.round((total / totalMovies) * 100) : 0;
        const percentSeen = total > 0 ? Math.round((seenCount / total) * 100) : 0;

        return {
            total,
            seenCount,
            notSeenCount: state.notSeen.length,
            percentComplete,
            percentSeen,
            remaining: totalMovies - total
        };
    }

    // ===== COMPRESSED EXPORT/IMPORT (v2) =====

    /**
     * Export progress as a compressed string
     * Uses bit array + LZ-String for ~50x compression
     * @param {Object} state - Current game state
     * @returns {string} Compressed export code
     */
    function exportCompressed(state) {
        try {
            // Create sets for O(1) lookup
            const seenSet = new Set(state.seen);
            const notSeenSet = new Set(state.notSeen);

            // Build bit array: 2 bits per movie
            // 00 = not rated, 01 = seen, 10 = not seen
            const totalMovies = (typeof MOVIES !== 'undefined') ? MOVIES.length : 5000;
            const bitsPerMovie = 2;
            const totalBytes = Math.ceil((totalMovies * bitsPerMovie) / 8);
            const bytes = new Uint8Array(totalBytes);

            // We need movie IDs - get them from the global MOVIES array
            if (typeof MOVIES !== 'undefined') {
                MOVIES.forEach((movie, index) => {
                    if (index >= totalMovies) return;

                    let value = 0; // not rated
                    if (seenSet.has(movie.id)) value = 1; // seen
                    else if (notSeenSet.has(movie.id)) value = 2; // not seen

                    const bitPosition = index * bitsPerMovie;
                    const byteIndex = Math.floor(bitPosition / 8);
                    const bitOffset = bitPosition % 8;

                    bytes[byteIndex] |= (value << bitOffset);
                });
            }

            // Convert to base64 string
            let binaryString = '';
            bytes.forEach(byte => {
                binaryString += String.fromCharCode(byte);
            });
            const base64 = btoa(binaryString);

            // Create export object with version marker
            const exportData = {
                v: 2,
                i: state.currentIndex,
                d: base64
            };

            // Compress the JSON
            const json = JSON.stringify(exportData);
            const compressed = LZString.compressToBase64(json);

            return compressed;
        } catch (error) {
            console.error('Failed to export compressed:', error);
            // Fallback to old format
            return exportLegacy(state);
        }
    }

    /**
     * Legacy export format (for backward compatibility)
     */
    function exportLegacy(state) {
        const exportData = {
            v: 1,
            s: state.seen,
            n: state.notSeen,
            i: state.currentIndex,
            t: Date.now()
        };
        return btoa(JSON.stringify(exportData));
    }

    /**
     * Import progress from a compressed or legacy string
     * @param {string} code - Export code
     * @returns {Object|null} Imported state or null if invalid
     */
    function importCompressed(code) {
        try {
            // Try v2 format first (LZ-String compressed)
            let data;
            try {
                const decompressed = LZString.decompressFromBase64(code);
                if (decompressed) {
                    data = JSON.parse(decompressed);
                }
            } catch (e) {
                // Not v2 format, try legacy
            }

            // Try legacy format (plain base64)
            if (!data) {
                try {
                    const json = atob(code);
                    data = JSON.parse(json);
                } catch (e) {
                    return null;
                }
            }

            // Handle v2 format (bit array)
            if (data.v === 2 && data.d) {
                return decodeBitArray(data);
            }

            // Handle v1 format (arrays)
            if (data.v === 1 && Array.isArray(data.s) && Array.isArray(data.n)) {
                return {
                    currentIndex: data.i || 0,
                    seen: data.s,
                    notSeen: data.n,
                    history: []
                };
            }

            return null;
        } catch (error) {
            console.error('Failed to import:', error);
            return null;
        }
    }

    /**
     * Decode bit array back to seen/notSeen arrays
     */
    function decodeBitArray(data) {
        try {
            const binaryString = atob(data.d);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const seen = [];
            const notSeen = [];

            if (typeof MOVIES !== 'undefined') {
                const totalMovies = MOVIES.length;
                MOVIES.forEach((movie, index) => {
                    if (index >= totalMovies) return;

                    const bitPosition = index * 2;
                    const byteIndex = Math.floor(bitPosition / 8);
                    const bitOffset = bitPosition % 8;

                    const value = (bytes[byteIndex] >> bitOffset) & 0b11;

                    if (value === 1) seen.push(movie.id);
                    else if (value === 2) notSeen.push(movie.id);
                });
            }

            return {
                currentIndex: data.i || 0,
                seen,
                notSeen,
                history: []
            };
        } catch (error) {
            console.error('Failed to decode bit array:', error);
            return null;
        }
    }

    /**
     * Generate shareable URL with embedded progress
     * @param {Object} state - Current game state
     * @returns {string} Full URL with progress parameter
     */
    function generateShareURL(state) {
        const code = exportCompressed(state);
        const baseURL = window.location.origin + window.location.pathname;
        return `${baseURL}?p=${encodeURIComponent(code)}`;
    }

    /**
     * Check URL for progress parameter and import if found
     * @returns {Object|null} Imported state or null
     */
    function checkURLForProgress() {
        const urlParams = new URLSearchParams(window.location.search);
        const progressCode = urlParams.get('p');

        if (progressCode) {
            const imported = importCompressed(decodeURIComponent(progressCode));
            if (imported) {
                // Clean up URL
                const cleanURL = window.location.origin + window.location.pathname;
                window.history.replaceState({}, '', cleanURL);
                return imported;
            }
        }
        return null;
    }

    // Save on page unload
    window.addEventListener('beforeunload', () => {
        saveImmediate();
    });

    // Public API
    return {
        load,
        save,
        saveImmediate,
        reset,
        getStats,
        exportCompressed,
        importCompressed,
        generateShareURL,
        checkURLForProgress,
        STORAGE_KEY
    };
})();

// Export for ES modules if available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
