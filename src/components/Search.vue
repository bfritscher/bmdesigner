<template>
  <div
    v-if="
      $store.state.layout.searchEnabled &&
      userSettings.search_key &&
      userSettings.search_key !== 'INIT' &&
      searchClient
    "
  >
    <ais-instant-search
      :search-client="searchClient"
      index-name="bmdesigner_notes_prod"
    >
      <v-dialog
        v-model="showDialog"
        scrollable
        origin="top right"
        max-width="800px"
        content-class="search-dialog"
      >
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>search</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-title class="d-flex flex-column align-start">
            <h3 class="h3">Search</h3>
            <ais-search-box>
              <template v-slot="{ currentRefinement, isSearchStalled, refine }">
                <v-text-field
                  full-width
                  clearable
                  placeholder="Project or Notes"
                  :value="currentRefinement"
                  @input="refine($event || '')"
                ></v-text-field>
                <span :hidden="!isSearchStalled">Loading...</span>
              </template>
            </ais-search-box>
            <div class="filters">
              <h6 class="subheading">Types</h6>
              <ais-refinement-list
                class="type-facet body-1"
                attribute="type"
                :sort-by="['count:desc', 'name:asc', 'isRefined:desc']"
                :transform-items="
                  items =>
                    items.map(item => ({
                      ...item,
                      label: TYPE_NAMES[item.value]
                    }))
                "
              >
                <template v-slot:item="{ item, refine }">
                  <v-chip
                    @click="refine(item.value)"
                    :outlined="!item.isRefined"
                  >
                    <v-badge inline :content="item.count">
                      {{ TYPE_NAMES[item.value] }}
                    </v-badge>
                  </v-chip>
                </template>
              </ais-refinement-list>

              <h6 class="subheading">Colors</h6>
              <ais-refinement-list
                attribute="colors"
                class="color-facet body-1"
                operator="and"
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
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-list two-line light class="search-result">
              <ais-hits>
                <template v-slot:item="{ item }">
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
                    @click="showDialog = false"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        <ais-highlight
                          :hit="item"
                          attribute="text"
                        ></ais-highlight
                        >&nbsp;
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
                  <v-divider></v-divider>
                </template>
              </ais-hits>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="showDialog = false"
              >Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </ais-instant-search>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { COLORS_MATERIAL_DARK, TYPE_NAMES } from "@/utils";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";

export default {
  data() {
    return {
      displayResults: false,
      COLORS_MATERIAL_DARK,
      TYPE_NAMES,
      localSearchStore: null,
      usedApiKey: "",
      showDialog: false
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

.ais-SearchBox {
  width: 100%;
}

.ais-Highlight-highlighted {
  background-color: #fff9c4;
}

.ais-Hits-list {
  padding: 0 !important;
}

.search-dialog .v-card .v-card__text {
  padding: 0;
}

.search-result .colors {
  text-align: right;
}

.search-result .colors > span {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  display: inline-block;
}
.search-dialog {
  align-self: flex-start;
}
</style>
