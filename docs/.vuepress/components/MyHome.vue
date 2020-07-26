<template>
<div>
    <div class="wrapper">
        <div class="head">Do Creative Work</div>
        <v-btn class="head-btn" outlined color="#ffffff" large href="/blog/" style="text-decoration: none;">
            START&nbsp<v-icon right>mdi-arrow-right</v-icon>
        </v-btn>
    </div>
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
export default {
    mounted(){
        let page = document.getElementsByClassName("page")[0]
        page.style.paddingTop = "3rem"
        page.style.paddingBottom = "0rem"

        let com = document.getElementsByClassName("comments-wrapper")[0]
        com.style.display = "none"

        
    }
};
</script>

<style scoped src="../../../node_modules/vuetify/dist/vuetify.min.css"></style>

<style>
.wrapper {
    width: 100vw;
    height: 91vh;
    background-image: url(/img/background.jpg);
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    background-attachment: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.my-footer {
    min-height: 12vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.head {
    color: #ffffff;
    font-size: 80px;
    font-weight: 100;
    animation: show 2s;
}

.head-btn {
    margin-top: 70px;
    animation: show 2.5s;
    
}

@keyframes show {
    from {
        transform: translateY(-50px);
        opacity: 0.1;
    }

    to {
        transform: translateY(0px);
        opacity: 1;
    }
}

@media (max-width: 719px) {
    .head {
        color: #ffffff;
        font-size: 40px;
        font-weight: 100;
    }
}
</style>
