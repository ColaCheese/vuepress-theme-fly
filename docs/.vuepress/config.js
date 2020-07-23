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
    dest: './dist', //  指定 vuepress build 的输出目录
    theme: 'reco', //  指定主题
    themeConfig: { //  主题设置
        type: 'blog',
        logo: '/img/favicon.ico',
        author: 'LOVELYY',
        authorAvatar: '/img/avater.png',
        modePicker: false,
        nav: [{ //  导航栏
                text: 'Home',
                link: '/',
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
        sidebar: {
            '/views/sidebar/': [
                '',
                'bar1',
                'bar2'
            ],
            '/views/sidebargroup/': [{
                    title: '基础',
                    collapsable: true,
                    children: [
                        '',
                        'bar1'
                    ]
                },
                {
                    title: '进阶',
                    collapsable: true,
                    children: [
                        'bar2'
                    ]
                },
            ]
        },
        sidebarDepth: 2,
        lastUpdated: 'Last Updated',
        friendLink: [
            {
              title: 'vuepress-theme-reco',
              desc: 'A simple and beautiful vuepress Blog & Doc theme.',
              logo: "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
              link: 'https://vuepress-theme-reco.recoluan.com'
            },
            {
              title: '午后南杂',
              desc: 'Enjoy when you can, and endure when you must.',
              email: 'recoluan@qq.com',
              link: 'https://www.recoluan.com'
            }
        ]
    },
    markdown: {
        lineNumbers: true
    }
}