<template>
  <div v-if="userSettings.search_key && searchStore" class="search-frame">
    <div class="input-group input-group--dirty input-group--tab-focused input-group--hide-details input-group--placeholder input-group--text-field input-group--single-line">
      <div class="input-group__input">
        <ais-search-box @click.native.prevent.stop="showIfResults" :search-store="searchStore" class="search-box" placeholder="Search your projects"></ais-search-box>
      </div>
      <div class="input-group__details">
        <div class="input-group__messages"></div>
      </div>
    </div>
    <div class="search-result-frame elevation-4" v-if="showResults">
      <div class="filters">
        <ais-powered-by></ais-powered-by>
        <h6 class="subheading">Types</h6>
        <ais-tree-menu :search-store="searchStore" class="type-facet" :attributes="['type']" :limit="20" :sort-by="['count:desc', 'name:asc', 'isRefined:desc']">
          <template scope="{ value, active, count }">
            <div v-badge="{ value: count }">
              {{TYPE_NAMES[value]}}
            </div>
          </template>
        </ais-tree-menu>
        <h6 class="subheading">Colors</h6>
        <ais-refinement-list :search-store="searchStore" attribute-name="colors" class="color-facet" :sort-by="['name:asc', 'count:desc', 'isRefined:desc',]">
          <template scope="{ value, active, count }">
            <v-btn :key="value" class="color" small fab :flat="active" @click.native="$event.target.parentNode.previousSibling.click()" :class="[COLORS_MATERIAL_DARK[value], active ? active : '']">
              {{count}}
              <v-icon v-if="active">check_circle</v-icon>
            </v-btn>
          </template>
        </ais-refinement-list>
      </div>
      <v-list three-line style="overflow: auto;">
        <ais-results :search-store="searchStore">
          <template scope="{ result }">
            <v-divider></v-divider>
            <v-list-tile class="search-result" :to="{name:'bmc', params: {id: result.canvasKey}}" @click.native="showResults=false">
              <v-list-tile-content>
                <v-list-tile-title>
                  <ais-highlight :result="result" attribute-name="text"></ais-highlight>
                </v-list-tile-title>
                <v-list-tile-sub-title class="grey--text text--darken-4 description">
                  <ais-highlight :result="result" attribute-name="description"></ais-highlight>
                </v-list-tile-sub-title>
                <v-list-tile-sub-title>
                  <ais-highlight :result="result" attribute-name="projectTitle"></ais-highlight>
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-list-tile-action-text>
                  <div class="type">{{TYPE_NAMES[result.type]}}</div>
                  <div class="colors">
                    <span v-for="colorId in result.colors" :class="COLORS_MATERIAL_DARK[colorId]" :key="colorId"></span>
                  </div>
                </v-list-tile-action-text>
              </v-list-tile-action>
            </v-list-tile>
          </template>
        </ais-results>
      </v-list>
      <ais-no-results :search-store="searchStore"></ais-no-results>
    </div>
  </div>
</template>

<script>
import { createFromAlgoliaCredentials, SearchBox, TreeMenu, RefinementList, PoweredBy, Results, NoResults, Highlight } from 'vue-instantsearch';
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { COLORS_MATERIAL_DARK, TYPE_NAMES } from '@/utils';


Vue.component('ais-search-box', SearchBox);
Vue.component('ais-tree-menu', TreeMenu);
Vue.component('ais-refinement-list', RefinementList);
Vue.component('ais-powered-by', PoweredBy);
Vue.component('ais-results', Results);
Vue.component('ais-no-results', NoResults);
Vue.component('ais-highlight', Highlight);

export default {
  data() {
    return {
      displayResults: false,
      COLORS_MATERIAL_DARK,
      TYPE_NAMES,
      localSearchStore: null,
      usedApiKey: '',
      showResults: false,
    };
  },
  computed: {
    ...mapGetters(['userSettings']),
    searchStore() {
      if (this.userSettings.search_key &&
        (!this.localSearchStore || this.usedApiKey !== this.userSettings.search_key)) {
        if (this.localSearchStore) {
          this.localSearchStore.stop();
        }
        this.localSearchStore = createFromAlgoliaCredentials('J26SA6A3VY', this.userSettings.search_key);
        this.localSearchStore.indexName = 'prod_notes';
        this.usedApiKey = this.userSettings.search_key;
        this.localSearchStore.start();
      }
      return this.localSearchStore;
    },
  },
  watch: {
    'searchStore.query': function searchStoreQuery(val) {
      this.showResults = !!val;
    },
  },
  methods: {
    showIfResults() {
      if (this.searchStore.query) {
        this.showResults = true;
      }
    },
  },
};
</script>

<style>
.color-facet .ais-refinement-list__checkbox {
  display: none;
}

.color-facet.ais-refinement-list {
  display: flex;
  min-height: 52px;
}

.color-facet .ais-refinement-list__item,
.color-facet .ais-refinement-list__label {
  display: block;
}

.type-facet .ais-tree-menu__list {
  display: flex;
  list-style-type: none;
  margin: 0;
  padding: 0;
  margin-left: -32px;
  flex-wrap: wrap;
}

.type-facet .ais-tree-menu__item {
  margin: 10px 0 10px 40px;
}

.type-facet .ais-tree-menu__item a {
  text-decoration: none;
}

.type-facet .ais-tree-menu__item a .badge:after {
  background-color: rgb(69, 90, 100);
}

.type-facet .ais-tree-menu__item.ais-tree-menu__item--active a .badge:after {
  background-color: #26a69a;
}

.type-facet .ais-tree-menu__item a {
  color: rgb(69, 90, 100);
}

.type-facet .ais-tree-menu__item.ais-tree-menu__item--active a {
  color: #26a69a;
}

.ais-highlight em {
  background-color: #fff9c4;
}

.search-result .type {
  word-wrap: none;
  white-space: nowrap;
}

.search-result .description {
  text-overflow: ellipsis;
  overflow: hidden;
}

.search-result .colors {
  text-align: right;
}

.search-result .colors>span {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  display: inline-block;
}

.search-result .list__tile__action {
  min-width: 120px;
}

.application--light .input-group .search-box input {
  color: white;
}

.search-box button {
  margin: 0px 8px;
  color: #fff;
}

.search-box button svg {
  fill: white;
}

.ais-clear--disabled {
  display: none;
}

.search-box form {
  display: flex;
  flex: 1 0 100%;
}

.ais-powered-by {
  position: absolute;
  right: 10px;
  top: 10px;
}

.search-result-frame {
  position: absolute;
  min-width: 80%;
  background-color: #fff;
  max-height: calc(100vh - 128px);
  max-width: 1024px;
  display: flex;
  flex-direction: column;
}

@media(min-width:1024px) {
  .search-result-frame {
    min-width: 0;
  }
}

.search-result-frame .filters {
  padding: 10px;
}

.application--light .search-frame .input-group:not(.input-group--error) .input-group__details:before {
  background-color: rgba(255, 255, 255, 0.42);
}

.application--light .search-frame .input-group:not(.input-group--error):not(.input-group--focused):not(.input-group--disabled):not(.input-group--overflow):not(.input-group--segmented):not(.input-group--editable):hover .input-group__details:before {
  background-color: rgba(255, 255, 255, 0.87);
}
</style>