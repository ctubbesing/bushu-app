<template>
  <div class="home">
    <img
      src="@/assets/b314_icon_inner.svg"
      alt="bushu314 logo"
      style="margin-top: 50px; max-width: 250px"
    />
    <div>
      window.ScrollY: {{ scrollVal }}
    </div>
    <div class="all-widgets">
      <!-- WaniKani -->
      <wanikani-widget />
      <basic-widget
        v-for="num in 5"
        :key="num"
      >
        <template v-slot:header>
          Test Widget {{ num }}
        </template>
        <div>
          test content a
        </div>
        <div>
          test content b
        </div>
        <b-button>Test Button</b-button>
      </basic-widget>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import BasicWidget from "@/components/BasicWidget.vue"
import WanikaniWidget from "@/components/WanikaniWidget.vue"

export default Vue.extend({
  name: "Home",
  components: {
    BasicWidget: BasicWidget,
    WanikaniWidget: WanikaniWidget,
  },
  data() {
    return {
      scrollVal: 0
    };
  },
  created () {
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed () {
    window.removeEventListener('scroll', this.handleScroll);
  },
  computed: {
    scrollAmt() {
      return window.scrollY
    }
  },
  methods: {
    handleScroll() {
      this.scrollVal = window.scrollY
    },
  },
});
</script>

<style>
.all-widgets {
  height: 2000px;
  margin: 20px;
  padding: 10px;
  border-radius: 10px;
  background-color: #fff5;
}
.widget {
  display: inline-block;
  margin: 5px;
  padding: 10px;
  background-color: #fff9;
  border-radius: 8px;
}
.widget-section {
  display: inline-block;
  margin: 5px;
  padding: 5px;
  background-color: #fff9;
  box-shadow: 0 0px 2px #888;
  border-radius: 5px;
}
</style>