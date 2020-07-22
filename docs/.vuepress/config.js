module.exports = {
    title: 'LoveYY\'s Blog',
    description: 'Do creative work',
    head: [ //  注入到当前页面的 HTML <head> 中的标签

    ],
    dest: './dist', //指定 vuepress build 的输出目录
    theme: 'reco', //指定主题

    themeConfig: {
        author: '雅婷',
        headImg: '/img/yating.jpg', //头像
        //导航栏
        nav: [{
                text: "Home",
                link: "/",
                icon: "reco-home"
            },
            {
                text: "TimeLine",
                link: "/timeline/",
                icon: "reco-date"
            },
            {
                text: "Docs",
                icon: "reco-message",
                items: [{
                    "text": "vuepress-reco",
                    "link": "/docs/theme-reco/"
                }]
            },
            {
                text: "Contact",
                icon: "reco-message",
                items: [{
                    text: "GitHub",
                    link: "https://github.com/recoluan",
                    icon: "reco-github"
                }],
                lastUpdated: 'Last Updated',
                smoothScroll: true,
                pageNum: 10, //目录每页显示条数
                // live2dModel: '/live2d/model/poi/poi.model.json', //live2d模型路径
                //gitalk留言设置
                footer: '粤ICP备案号：18150247号'
            }
        ],
        sidebar: {
            "./docs/": [
                "",
                "theme",
                "plugin",
                "api"
            ]
        },
        type: "blog",
        blogConfig: {
            category: {
                location: 2,
                text: "Category"
            },
            tag: {
                location: 3,
                text: "Tag"
            }
        },
        friendLink: [{
                title: "午后南杂",
                desc: "Enjoy when you can, and endure when you must.",
                email: "1156743527@qq.com",
                link: "https://www.recoluan.com"
            },
            {
                title: "vuepress-theme-reco",
                desc: "A simple and beautiful vuepress Blog & Doc theme.",
                avatar: "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
                link: "https://vuepress-theme-reco.recoluan.com"
            }
        ],
        logo: "/logo.png",
        search: true,
        searchMaxSuggestions: 10,
        lastUpdated: "Last Updated",
        author: "LoveYY",
        authorAvatar: "/avatar.png",
        record: "xxxx",
        startYear: "2017"
    },
    markdown: {
        lineNumbers: true
    }
}