module.exports = {
    title: 'LOVEYY BLOG',
    description: 'Do creative work',
    head: [ //  注入到当前页面的 HTML <head> 中的标签
        ['link', {
            rel: 'icon',
            type: 'image/x-icon',
            href: '/img/favicon.ico'
        }],
        ['meta', {
            name: 'viewport',
            content: 'width=device-width,initial-scale=1,user-scalable=no'
        }],
        ['link', {
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css'
        }]
    ],
    theme: 'reco', //  指定主题
    themeConfig: { //  主题设置
        type: 'blog',
        logo: '/img/favicon.ico',
        author: 'LOVELYY',
        authorAvatar: '/img/avater.png',
        modePicker: true,
        nav: [{ //  导航栏
                text: 'Home',
                link: 'https://www.flynoodle.xyz/',
                icon: 'reco-home'
            },
            {
                text: 'Blog',
                link: '/blog/',
                icon: 'reco-category'
            },
            {
                text: 'TimeLine',
                link: '/timeline/',
                icon: 'reco-date'
            },
            {
                text: 'Github',
                link: 'https://github.com/Love-YY',
                icon: 'reco-github'
            },
        ],
        sidebar: 'auto',
        sidebarDepth: 2,
        valineConfig: {
            appId: process.env.APPID,  //  your appId
            appKey: process.env.APPKEY, //  your appKey
        }
    },
    markdown: {
        lineNumbers: true
    }
}