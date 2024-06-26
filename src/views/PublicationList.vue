<template>
  <List
    v-if="collectionStore.totalPerPublication && coaStore.issueCounts"
    :items="sortedItems"
    :get-target-route-fn="getTargetUrlFn"
    :get-item-text-fn="getItemTextFn"
  >
    <template #fill-bar="{ item }" v-if="ownershipPercentages">
      <ion-progress-bar :value="ownershipPercentages[item.publicationcode].ownershipPercentage || 0" />
    </template>
    <template #row-label="{ item }">
      <Publication :key="item.publicationcode" :label="item.publicationname" />
    </template>
    <template #row-suffix="{ item }" v-if="ownershipPercentages">
      {{
        ownershipPercentages[item.publicationcode]
          ? getOwnershipText(ownershipPercentages[item.publicationcode], false)
          : ''
      }}
    </template>
  </List>
</template>

<script setup lang="ts">
import { stores } from '~web';

import { getOwnershipPercentages, getOwnershipText } from '~/composables/useOwnership';
import { app } from '~/stores/app';
import { wtdcollection } from '~/stores/wtdcollection';

const collectionStore = wtdcollection();
const coaStore = stores.coa();
const appStore = app();

const getIssueCountPerMagazinecode = (issueCountPerPublicationcode: Record<string, number>) =>
  Object.entries(issueCountPerPublicationcode)
    .filter(([publicationcode]) => publicationcode.startsWith(`${route.params.countrycode}/`))
    .reduce((acc, [publicationcode, total]) => ({ ...acc, [publicationcode]: total }), {});

const totalPerPublication = computed(
  () =>
    (collectionStore.totalPerPublication && getIssueCountPerMagazinecode(collectionStore.totalPerPublication)) ||
    undefined,
);
const issueCounts = computed(() => getIssueCountPerMagazinecode(coaStore.issueCounts || {}));

const ownershipPercentages = computed(() => getOwnershipPercentages(totalPerPublication.value, issueCounts.value));

const route = useRoute();

const getItemTextFn = (item: (typeof items)['value'][0]['item']) => item.publicationname || item.publicationcode;

const getTargetUrlFn = (key: string) => ({
  name: 'IssueList',
  params: { type: route.params.type, publicationcode: key },
});

const items = computed(() =>
  coaStore.publicationNames
    ? appStore.isCoaView
      ? Object.entries(coaStore.publicationNames)
          .filter(([publicationcode]) => new RegExp(`^${route.params.countrycode}/`).test(publicationcode))
          .map(([publicationcode, publicationname]) => ({
            key: publicationcode,
            item: { publicationcode, publicationname },
          }))
      : collectionStore
          .ownedPublications!.filter(
            (publicationcode) =>
              publicationcode.indexOf(`${route.params.countrycode}/`) === 0 &&
              coaStore.publicationNames![publicationcode],
          )
          .map((publicationcode) => ({
            key: publicationcode,
            item: {
              publicationcode,
              publicationname: coaStore.publicationNames![publicationcode] || publicationcode,
            },
          }))
    : [],
);

const sortedItems = computed(() =>
  [...items.value].sort(({ item: { publicationname: text1 } }, { item: { publicationname: text2 } }) =>
    text1.toLowerCase().localeCompare(text2.toLowerCase()),
  ),
);
</script>
