import { env } from "../config/env";

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

/**
 * Simple in-memory cache for API responses
 * In production, consider using Redis for distributed caching
 */
class LocationCache {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private cacheDurationMs: number = env.CACHE_DURATION_HOURS * 60 * 60 * 1000;

    /**
     * Generate cache key from coordinates
     */
    private generateKey(latitude: number, longitude: number, prefix: string): string {
        // Round to 3 decimal places (~111 meters accuracy) to group nearby locations
        const lat = Math.round(latitude * 1000) / 1000;
        const lon = Math.round(longitude * 1000) / 1000;
        return `${prefix}:${lat},${lon}`;
    }

    /**
     * Get cached value if it exists and is not expired
     */
    get<T>(latitude: number, longitude: number, prefix: string): T | null {
        const key = this.generateKey(latitude, longitude, prefix);
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check if cache has expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set cache value with expiration
     */
    set<T>(latitude: number, longitude: number, prefix: string, data: T): void {
        const key = this.generateKey(latitude, longitude, prefix);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.cacheDurationMs,
        });
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        let validEntries = 0;
        let expiredEntries = 0;

        for (const entry of this.cache.values()) {
            if (Date.now() > entry.expiresAt) {
                expiredEntries++;
            } else {
                validEntries++;
            }
        }

        // Clean up expired entries
        if (expiredEntries > 0) {
            for (const [key, entry] of this.cache.entries()) {
                if (Date.now() > entry.expiresAt) {
                    this.cache.delete(key);
                }
            }
        }

        return {
            totalEntries: this.cache.size,
            validEntries,
            expiredEntries,
            cacheDurationHours: env.CACHE_DURATION_HOURS,
        };
    }
}

// Export singleton instance
export const locationCache = new LocationCache();
