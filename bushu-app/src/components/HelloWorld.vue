<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div>
      <slot></slot>
    </div>
    <button @click="fetchAWS">test AWS fetch</button>
    <button @click="axiosAWS">test AWS axios</button>
    <div>
      {{ responseStr }}
    </div>
    <p>
      For a guide and recipes on how to configure / customize this project,<br />
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener"
        >vue-cli documentation</a
      >.
    </p>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <br>
    <h3>Installed CLI Plugins</h3>
    <ul>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel"
          target="_blank"
          rel="noopener"
          >babel</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-router"
          target="_blank"
          rel="noopener"
          >router</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-vuex"
          target="_blank"
          rel="noopener"
          >vuex</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint"
          target="_blank"
          rel="noopener"
          >eslint</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript"
          target="_blank"
          rel="noopener"
          >typescript</a
        >
      </li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li>
        <a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a>
      </li>
      <li>
        <a href="https://forum.vuejs.org" target="_blank" rel="noopener"
          >Forum</a
        >
      </li>
      <li>
        <a href="https://chat.vuejs.org" target="_blank" rel="noopener"
          >Community Chat</a
        >
      </li>
      <li>
        <a href="https://twitter.com/vuejs" target="_blank" rel="noopener"
          >Twitter</a
        >
      </li>
      <li>
        <a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a>
      </li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li>
        <a href="https://router.vuejs.org" target="_blank" rel="noopener"
          >vue-router</a
        >
      </li>
      <li>
        <a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a>
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-devtools#vue-devtools"
          target="_blank"
          rel="noopener"
          >vue-devtools</a
        >
      </li>
      <li>
        <a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener"
          >vue-loader</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/awesome-vue"
          target="_blank"
          rel="noopener"
          >awesome-vue</a
        >
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import axios from 'axios'

export default Vue.extend({
  name: "HelloWorld",
  props: {
    msg: String,
  },
  data() {
    return {
      responseStr: '' as string
    }
  },
  methods: {
    async axiosAWS() {
      console.log("axiosAWS: Start.")

      let body = {
        firstName: "Rand",
        lastName: "al'Thor",
      }
      let r = await axios.post("https://q1n530x0ej.execute-api.us-west-2.amazonaws.com/dev", body)
      console.log("r:")
      console.log(r)

      this.responseStr = r.data.body

      console.log("Done.")
    },
    async fetchAWS() {
      console.log("fetchAWS: Start.")

      let fetchData = null as null | { statusCode: number, body: string }
      await fetch("https://q1n530x0ej.execute-api.us-west-2.amazonaws.com/dev", {
        "referrer": "https://dev4317.dq4zxpahcrq3a.amplifyapp.com/",
        "body": "{\"firstName\":\"Lyra\",\"lastName\":\"Silvertongue\"}",
        "method": "POST",
      })
      .then(response => response.json())
      .then(data => fetchData = data)

      this.responseStr = fetchData ? fetchData.body : '[fetchData is undefined]'
      console.log(fetchData)
      console.log(this.responseStr)
      console.log("Done.")
    },
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
