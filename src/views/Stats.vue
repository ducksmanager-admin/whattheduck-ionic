<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary" />
        </ion-buttons>
        <ion-title>{{ t('Statistiques') }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" v-if="wtdCollectionStore.issues">
      <ion-row style="height: 25vh" class="ion-text-center">
        <ion-row class="ion-text-center" style="height: 75%">
          <ion-col size="4" class="text-big">{{ wtdCollectionStore.ownedCountries!.length }}</ion-col
          ><ion-col size="4" class="text-big">{{ wtdCollectionStore.ownedPublications!.length }}</ion-col
          ><ion-col size="4" class="text-big">{{ wtdCollectionStore.total }}</ion-col></ion-row
        >
        <ion-row class="ion-text-center" style="height: 25%">
          <ion-col size="4">{{ t('pays') }}</ion-col
          ><ion-col size="4">{{ t('magazines') }}</ion-col
          ><ion-col size="4" style="flex-direction: column"
            ><div>{{ t('numéros') }}</div>
            <small>{{
              t('dont {copies} double|dont {copies} doubles', {
                copies: wtdCollectionStore.total! - wtdCollectionStore.totalUniqueIssues,
              })
            }}</small>
          </ion-col></ion-row
        >
      </ion-row>
      <ion-row style="height: 50vh" class="ion-padding-vertical">
        <ion-col size="12" class="ion-justify-content-around" style="flex-direction: column">
          <ion-text style="height: 20%" class="text-medium">{{ t('Etats des numéros') }}</ion-text>
          <ConditionsComponent
            :style="{ width: '100%', height: '80%' }"
            :conditions="conditionsWithoutMissing"
            :number-per-condition="numberPerCondition"
        /></ion-col>
      </ion-row>
      <ion-row style="height: 25vh">
        <ion-col size="12" class="ion-text-center ion-justify-content-around" style="flex-direction: column">
          <ion-text class="text-medium">{{ t('Valeur de la collection') }}</ion-text>
          <ion-text class="text-big">{{ wtdCollectionStore.quotationSum }}&euro;</ion-text>
          <template v-if="highestQuotedIssue">
            <ion-text>{{ t('Numéro le plus côté :') }}</ion-text>
            <ion-text>
              <Condition :value="highestQuotedIssue.condition" />
              {{ coaStore.publicationNames[highestQuotedIssue.publicationcode] }}
              {{ highestQuotedIssue.issuenumber }}</ion-text
            ></template
          >
          <ion-text v-else>{{ t('Vous ne possédez pas de numéro côté.') }}</ion-text>
        </ion-col>
      </ion-row>
      <ion-row style="height: calc(100vh - 50px)" class="ion-align-items-center">
        <ion-col size="12" class="ion-text-center ion-justify-content-around" style="flex-direction: column">
          <ion-text :style="{ height: '60px' }" class="text-medium">{{ t('Progression de la collection') }}</ion-text>
          <ion-row :style="{ height: '60px' }">
            <ion-col v-for="{ title, value } of collectionProgressionGraphTypes">
              <ion-button
                expand="block"
                :fill="value === currentCollectionProgressionGraphType ? 'solid' : 'outline'"
                @click="currentCollectionProgressionGraphType = value"
                >{{ title }}</ion-button
              >
            </ion-col></ion-row
          >
          <PurchaseGraph :since="currentCollectionProgressionGraphType" :style="{ height: 'calc(100% - 140px)' }"
        /></ion-col>
      </ion-row> </ion-content
  ></ion-page>
</template>

<script setup lang="ts">
import { components } from '~web';
import { coa } from '~web/src/stores/coa';

import { wtdcollection } from '~/stores/wtdcollection';

const { conditionsWithoutMissing } = useCondition();

const ConditionsComponent = components['Conditions'];
const { t } = useI18n();

type GraphType = 'pastYear' | 'allTime';
const currentCollectionProgressionGraphType = ref('pastYear' as GraphType);
const collectionProgressionGraphTypes: { title: string; value: GraphType }[] = [
  {
    title: t('Depuis 1 an'),
    value: 'pastYear',
  },
  {
    title: t('Depuis le début'),
    value: 'allTime',
  },
];

const wtdCollectionStore = wtdcollection();
const coaStore = coa();

const numberPerCondition = computed(() => wtdCollectionStore.numberPerCondition);
const highestQuotedIssue = computed(() => wtdCollectionStore.highestQuotedIssue);

(async () => {
  coaStore.fetchIssueQuotations(wtdCollectionStore.ownedPublications!);
})();
</script>

<style lang="scss" scoped>
ion-row,
ion-col {
  width: 100%;
  height: 100%;
  display: flex;
}

ion-col {
  align-items: center;
  justify-content: center;

  :deep(.wrapper) {
    height: 100% !important;
  }
}

ion-title {
  padding-inline: 0;
}

ion-button {
  width: 100%;
}

.text-medium {
  font-size: 24px;
}

.text-big {
  font-size: 52px;
}
</style>
