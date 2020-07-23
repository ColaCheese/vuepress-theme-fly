module.exports = {
    title: 'LOVEYY BLOG',
    description: 'Do creative work',
    head: [ //  注入到当前页面的 HTML <head> 中的标签
        ['link', {
            rel: 'icon',
            type: 'image/x-icon',
            href: '/img/favicon.ico'
        }]
    ],
    dest: './dist', //指定 vuepress build 的输出目录
    theme: 'reco', //指定主题


    themeConfig: {
        logo: '/img/favicon.ico',
        author: 'LYY',
        //导航栏
        nav: [{
                text: '主页',
                link: '/'
            },
            {
                text: '博文',
                link: 'https://www.github.com/codeteenager'
            },
            {
                text: '关于',
                link: '/about/'
            },
            {
                text: 'Github',
                link: 'https://www.github.com/codeteenager'
            },
        ],
        sidebar: {
            '/android/': [
                "",
                "android1",
            ],
            "/ios/": [
                "",
                "ios1",
            ],
            "/web/": [
                "",
                "web1",
            ],
        },
        sidebarDepth: 2,
        lastUpdated: 'Last Updated',
    },
    markdown: {
        lineNumbers: true
    }
}