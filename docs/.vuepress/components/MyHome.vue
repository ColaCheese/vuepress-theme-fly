<template>
<div>
    <div class="wrapper"></div>
    <v-footer class="my-footer" absolute color="#FFFFFF">
        <span style="margin-top: 12px; font-size: 14px;">
            &copy;
            {{ (new Date()).getFullYear() }}
            <a href="https://github.com/Love-YY" target="_blank">LOVEYY </a>
            BLOG 
            <v-icon color="#FF5252" small>mdi-heart</v-icon>
            RECORD
        </span>
        <span style="margin-top: 14px; font-size: 15px;">
          Power By&nbsp&nbsp
          <a href="https://github.com/vuejs/vuepress" target="_blank"> vuepress </a>|
          <a href="https://github.com/vuepress-reco" target="_blank"> vuepress-reco </a>|
          <a href="https://github.com/vuetifyjs/vuetify" target="_blank"> vuetify</a>
        </span>
    </v-footer>

</div>
</template>

<script>
export default {};
</script>

<style>
.page {
    padding-top: 3rem;
    padding-bottom: 0rem;
}

.page .page-edit {
    padding: 0;
    margin: 0;
}

.content__default:not(.custom) {
    max-width: none;
    padding: 0;
}

.comments-wrapper {
    display: none;
}

.wrapper {
    width: 100vw;
    height: 91vh;
    background-image: url(/img/background.jpg);
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    background-attachment: fixed;
}

.my-footer {
    min-height: 12vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
</style>
