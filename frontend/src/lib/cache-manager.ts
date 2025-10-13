// Cache manager for API routes
// Since revalidateTag doesn't work in API routes, we use a versioning approach

interface CacheVersion {
  weddingInfo: number;
  programEvents: number;
}

// In-memory cache versions (in production, you might want to use Redis or a database)
const cacheVersions: CacheVersion = {
  weddingInfo: Date.now(),
  programEvents: Date.now(),
};

export const CacheManager = {
  // Get current cache version for a specific cache
  getVersion(cacheName: keyof CacheVersion): number {
    return cacheVersions[cacheName];
  },

  // Invalidate cache by updating its version
  invalidate(cacheName: keyof CacheVersion): void {
    cacheVersions[cacheName] = Date.now();
    console.log(
      `✅ Cache invalidated: ${cacheName} (version: ${cacheVersions[cacheName]})`,
    );
  },

  // Check if cache should be invalidated based on version
  shouldInvalidate(
    cacheName: keyof CacheVersion,
    lastVersion?: number,
  ): boolean {
    if (!lastVersion) return true;
    return cacheVersions[cacheName] > lastVersion;
  },

  // Get all current versions
  getAllVersions(): CacheVersion {
    return { ...cacheVersions };
  },
};
