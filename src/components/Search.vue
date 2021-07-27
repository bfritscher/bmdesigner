<template>
  <div v-if="userSettings.search_key && searchClient" class="search-frame">
    <ais-instant-search
      :search-client="searchClient"
      index-name="bmdesigner_notes_prod"
    >
      <div
        class="
          input-group
          input-group--dirty
          input-group--tab-focused
          input-group--hide-details
          input-group--placeholder
          input-group--text-field
          input-group--single-line
        "
      >
        <div class="input-group__input">
          <ais-search-box
            @click.native.prevent.stop="showIfResults"
            class="search-box"
            placeholder="Search your projects"
          ></ais-search-box>
        </div>
        <div class="input-group__details">
          <div class="input-group__messages"></div>
        </div>
      </div>
      <div class="search-result-frame elevation-4" v-if="showResults">
        <div class="filters">
          <h6 class="subheading">Types</h6>
          <ais-refinement-list
            class="type-facet"
            attribute="type"
            :sort-by="['count:desc', 'name:asc', 'isRefined:desc']"
            :transform-items="
              items =>
                items.map(item => ({ ...item, label: TYPE_NAMES[item.value] }))
            "
          >
            <template v-slot:item="{ item, refine }">
              <div @click="refine(item.value)">
                <v-badge :content="item.count">
                  {{ TYPE_NAMES[item.value] }}
                </v-badge>
              </div>
            </template>
          </ais-refinement-list>

          <h6 class="subheading">Colors</h6>
          <ais-refinement-list
            attribute="colors"
            class="color-facet"
            :sort-by="['name:asc', 'count:desc', 'isRefined:desc']"
          >
            <template v-slot:item="{ item, refine }">
              <v-btn
                class="color"
                small
                fab
                :text="item.isRefined"
                @click="refine(item.value)"
                :class="[
                  COLORS_MATERIAL_DARK[item.value],
                  item.isRefined ? 'active' : ''
                ]"
              >
                {{ item.count }}
                <v-icon v-if="item.isRefined">check_circle</v-icon>
              </v-btn>
            </template>
          </ais-refinement-list>
        </div>
        <v-list three-line style="overflow: auto" light>
          <ais-hits>
            <template v-slot:item="{ item }">
              <v-divider></v-divider>
              <v-list-item
                class="search-result"
                :to="{
                  name: 'bmc',
                  params: {
                    id: item.canvasKey,
                    zoom1: item.objectID.split('.')[1]
                  }
                }"
                exact
                @click.native="showResults = false"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    <ais-highlight :hit="item" attribute="text"></ais-highlight>
                  </v-list-item-title>
                  <v-list-item-subtitle
                    class="grey--text text--darken-4 description"
                  >
                    <ais-highlight
                      :hit="item"
                      attribute="description"
                    ></ais-highlight>
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    <ais-highlight
                      :hit="item"
                      attribute="projectTitle"
                    ></ais-highlight>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-list-item-action-text>
                    <div class="type">{{ TYPE_NAMES[item.type] }}</div>
                    <div class="colors">
                      <span
                        v-for="colorId in item.colors"
                        :class="COLORS_MATERIAL_DARK[colorId]"
                        :key="colorId"
                      ></span>
                    </div>
                  </v-list-item-action-text>
                </v-list-item-action>
              </v-list-item>
            </template>
          </ais-hits>
        </v-list>
      </div>
    </ais-instant-search>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { COLORS_MATERIAL_DARK, TYPE_NAMES } from "@/utils";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

//TODO: Use custom user filtered search key
//TODO: Server save to typesense
//TODO: generate key for user
//TODO: reindex all data
//TODO: CSS
//TODO: FIX dismiss dialog

export default {
  data() {
    return {
      displayResults: false,
      COLORS_MATERIAL_DARK,
      TYPE_NAMES,
      localSearchStore: null,
      usedApiKey: "",
      showResults: false
    };
  },
  computed: {
    ...mapGetters(["userSettings"]),
    searchClient() {
      const typesenseInstantsearchAdapter = new TypesenseInstantSearchAdapter({
        server: {
          nodes: [
            {
              protocol: "https",
              host: "typesense.bf0.ch",
              port: "443"
            }
          ],
          apiKey: this.userSettings.search_key
        },
        // The following parameters are directly passed to Typesense's search API endpoint.
        //  So you can pass any parameters supported by the search endpoint below.
        //  queryBy is required.
        additionalSearchParameters: {
          queryBy: "text,description,projectTitle"
        }
      });
      return typesenseInstantsearchAdapter.searchClient;
    }
  },
  methods: {
    showIfResults() {
      this.showResults = true;
    }
  }
};
</script>

<style>
.ais-RefinementList-list {
  display: flex;
  list-style-type: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.ais-Hits-list {
  list-style-type: none;
}

.ais-InstantSearch {
  color: black;
}

/*  color: #26a69a; */

.ais-Highlight-highlighted {
  background-color: #fff9c4;
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

@media (min-width: 1024px) {
  .search-result-frame {
    min-width: 0;
  }
}

.search-result-frame .filters {
  padding: 10px;
}

.application--light
  .search-frame
  .input-group:not(.input-group--error)
  .input-group__details:before {
  background-color: rgba(255, 255, 255, 0.42);
}

.application--light
  .search-frame
  .input-group:not(.input-group--error):not(.input-group--focused):not(.input-group--disabled):not(.input-group--overflow):not(.input-group--segmented):not(.input-group--editable):hover
  .input-group__details:before {
  background-color: rgba(255, 255, 255, 0.87);
}
</style>
