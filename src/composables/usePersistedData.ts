import { Storage } from '@ionic/storage';

const storage = new Storage().create();

export default async (entries: Record<string, Ref<any>>): Promise<void> =>
  storage.then(async (persistedStorage) => {
    for (const [persistedRefKey, persistedRef] of Object.entries(entries)) {
      const persistedValue = await persistedStorage.get(persistedRefKey);
      if (persistedValue !== null) {
        try {
          persistedRef.value = JSON.parse(persistedValue);
        } catch (e) {
          console.error(e);
        }
      }
    }

    watch(
      Object.values(entries),
      async () => {
        for (const [persistedRefKey, persistedRef] of Object.entries(entries)) {
          await persistedStorage.set(persistedRefKey, JSON.stringify(persistedRef.value));
        }
      },
      { deep: true },
    );
  });
