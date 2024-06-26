<template>
  <ion-segment v-if="parts" :value="currentNavigationItem" @ionChange="onChange">
    <ion-segment-button v-for="{ id, text, component } in parts" :id="id" :value="id">
      <component v-if="component" :is="component" :id="id" :label="text" />
      <ion-label v-else>{{ text }}</ion-label>
    </ion-segment-button>
  </ion-segment>
</template>

<script setup lang="ts">
import { stores } from '~web';

import Country from './Country.vue';
import Publication from './Publication.vue';

import { app } from '~/stores/app';

const router = useRouter();
const route = useRoute();

const { currentNavigationItem } = storeToRefs(app());
const { countryNames, publicationNames } = storeToRefs(stores.coa());

const { t } = useI18n();

const parts = computed(() => {
  if (!countryNames.value) {
    return [];
  }
  const parts: { text?: string; id: string; component?: any; badge?: string }[] = [
    {
      id: '',
      text: t('Tous les pays'),
    },
  ];
  if (currentNavigationItem.value) {
    const publicationParts = currentNavigationItem.value.split('/');
    parts.push({
      component: Country,
      id: publicationParts[0],
      text: countryNames.value?.[publicationParts[0]] || publicationParts[0],
    });
    if (publicationParts.length === 2) {
      parts.push({
        component: Publication,
        id: currentNavigationItem.value,
        text: publicationNames.value[currentNavigationItem.value]!,
      });
    }
  }
  return parts;
});

const onChange = (event: { detail: { value?: number | string } }) => {
  const target = event.detail.value as string | undefined;
  router.push({
    path: target ? `/collection/${(/\//.test(target) ? 'issues' : 'publications') + target}` : '/collection',
    query: { coa: route.query.coa },
  });
};
</script>

<style lang="scss" scoped>
ion-segment {
  display: flex;
  justify-content: start;
  height: 48px;
  background-color: var(--ion-background-color);
}

ion-segment-button {
  width: 33.333%;
  max-width: 33.333%;
  align-items: center;
  align-self: start;
  text-transform: none;
  white-space: normal;

  ion-badge {
    margin-top: 8px;
  }

  ion-label {
    width: 100%;
    white-space: normal;
    overflow-y: auto;
  }

  &::part(native) {
    padding: 0;
    max-width: 100%;
  }
}
</style>
