// LRU Cache
// Least Recently Used Cache
/*
  LRUCacheManager
  constructor -> 
    - new Map() -> Cache 
    - new array -> AccessedKeys
    - new Map() -> AccessedKeysIndexes    
  get(key: string) => object from the cache or null if no key has been found
  set(key: string, value: any) => boolean : ack or no ack


  get(key: string): O(n)
    - find the key in the Map object : map.get(key)
    - get the old position with the AccessedKeysIndexes if it was already added
    - push the key in the AccessedKeys array
    - set the index corresponding to the key in the AccessedKeysIndexes with <key,AccessedKeys.length - 1>
    - the position of key in AccessedKeys is known e.g. 5, 
    - AccessedKeys: [1,2,3], we access 1, index of this is 0: O(n)


  Fixed length problematic : 
  set -> O(1)
    - calculate the size of value
    - get remaining left space in the cache
    - if enough space -> write in the cache
    - otherwise -> LRU rule 
        - get the last AccessedKeys from the array 
        - remove them from the AccessKeys array
        - remove them from the cache

*/

class LRUCacheManager {
  cache;
  accessedKeys;
  accessedKeysIndexes;
  maxCacheSize = 5;

  constructor() {
    this.cache = new Map();
    this.accessedKeys = [];
    this.accessedKeysIndexes = new Map();
  }

  get(key) {
    const cachedObject = this.cache.get(key);
    if (cachedObject) {
      console.log('Found object', key, cachedObject);
      const oldPositionOfKey = this.accessedKeysIndexes.get(key);
      if (oldPositionOfKey >= 0) {
        this.accessedKeys = this.accessedKeys.splice(oldPositionOfKey, 1);
      }
      this.accessedKeys.push(key);
      this.accessedKeysIndexes.set(key, this.accessedKeys.length - 1);
      return cachedObject;
    }
    return undefined;
  }

  set(key, value) {
    const willMaxSizeBeReached =
      this.maxCacheSize - (this.accessedKeys.length + 1) === 0;
    console.log(
      'Cache size control',
      this.maxCacheSize,
      this.accessedKeys.length + 1,
    );
    console.log(
      'Setting value in cache',
      key,
      value,
      willMaxSizeBeReached,
      this.accessedKeys.length,
    );
    if (willMaxSizeBeReached) {
      console.log('Max cache size reach, freeing some space');
      const lastKey = this.accessedKeys[this.accessedKeys.length - 1];
      const lastKeyIndex = this.accessedKeys.pop();
      this.accessedKeysIndexes.delete(lastKey);
      console.log('Key removed from cache', lastKey, lastKeyIndex);
    }
    this.cache.set(key, value);
    return true;
  }

  printCache() {
    console.log(this.cache, this.accessedKeys, this.accessedKeysIndexes);
  }
}

const cacheManager = new LRUCacheManager();

cacheManager.set('key0', '0');
cacheManager.printCache();
cacheManager.set('key1', '1');
cacheManager.printCache();
cacheManager.set('key2', '2');
cacheManager.printCache();
cacheManager.set('key3', '3');
cacheManager.printCache();
cacheManager.set('key4', '4');
cacheManager.printCache();
cacheManager.set('key5', '5');
cacheManager.printCache();

cacheManager.get('key0');
cacheManager.get('key3');
