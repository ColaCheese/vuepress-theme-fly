---
title: 当 VuePress 遇上 Vuetify
date: 2020-07-27
tags:
 - vuepress
 - vuetify
categories: 
 - blog
---

对最近搭建个人 Blog 的一次技术总结。:yum: :yum:

<!-- more -->

## 简单总结一下

首先还是要感谢 `vuepress` 和 `vuepress-theme-reco` 它们的开发维护者。不得不说 `vuepress` 是对使用过 `Vue` 的人来说，搭建个人 Blog 的一个非常好的选择。当然，比较流行的 `Hexo` 我之前也没用过，不好做对比，但是 `vuepress` 整体带给我的体验还是非常不错的。 `vuepress` 自带默认的主题，但是它的风格更像一个技术文档，而不是一个 Blog ，然后我去知乎上搜 `vuepress` 的好看的主题，发现了 `vuepress-theme-reco`。作者给出的文档非常详细，而且整体的界面设计也非常好看，如果直接用这个主题来修改的话，搭建个人 Blog 将会非常非常的简单方便。

但是，我给自己挖了一个大坑，:sob:我觉得 `vuepress-theme-reco` 的 Home 页还可以再改一下，也就是现在我的 Blog 的 Home 页的样式，然后我就想用 `vuetify` 来美化一下。选择 `vuetify` 是因为它的文档真的非常非常非常详细，而且整体设计很合我的胃口，再加上 `vue` 的作者力荐，所以我决定要引入 `vuetify` 。

下面开始填坑。

## 第一个坑

所以，应该如何引入 `vuetify` 。这个不难解决，还是能搜到方法的，在 `vuepress` 文档里面也给出了方法，通过创建 `.vuepress/enhanceApp.js` 文件可以做一些应用级别的配置，当该文件存在的时候，会被导入到应用内部。当然，首先还是要用 `npm install vuetify` 安装对应的 npm 包。

```js
import Vuetify from 'vuetify'
import '../../node_modules/vuetify/dist/vuetify.min.css'
export default ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the options for the root Vue instance
  router, // the router instance for the app
  siteData // site metadata
}) => {
  Vue.use(Vuetify);
}
```
如果要用到 `material design icons` 别忘记在 `config.js` 中添加：

```js
['link', {
    rel: 'stylesheet',
    href: 'https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css'
}]
```
这个链接相当于在 `index.html` 的 `<head>` 中添加 `<link>` 标签。所以我们就能愉快地用 `material design icons` 了。

好了，坑，他来了。

这样引入之后， `vuetify` 其实被作用到了全局，后面页面的样式都被 `vuetify` 覆盖了。不过这个解决方法还是有的，把 `vuetify` 单独的 CSS 引入放到具体的页面上来，也就是在我的 `MyHome.vue` 中引入 CSS，因为，造成样式混乱的只有 CSS 文件。一定要在 `<style>` 中添加 `scoped` ，不然样式还是会被应用到全局。

```html
<style scoped src="../../../node_modules/vuetify/dist/vuetify.min.css"></style>
```

## 第二个坑

可以愉快地修改页面了，修改完 Build 上传，咦，怎么和我本地运行地样式不一样？？冲浪一番发现，没有 `vuepress` Build 样式不一样的问题，除了 stackoverflow 上倒是有个老哥有类似的问题，但是可怜的老哥一年多都没人回答。其实，倒是有很多， `Vue` 的 Run 样式和 Build 样式不一样的问题，解决的方法无非是给 `<style>` 标签添加 `scoped` 、在 `main.js` 里面调整样式的引入顺序，在 `vuepress` 里面行不通。我尝试了好多办法，包括添加 `index.styl` 文件，在 MarkDown 文件中添加样式、自定义页面的方式引入 `Vue` 文件等，莫有成功。

其实症结在于，我在 `MyHome.vue` 中，对之后也会用到的样式做了调整，比如有的 DOM 元素，我就不想让它显示，用选择器修改之后，后面再加载的样式覆盖了之前的样式，这一点在利用 Chrome 的控制台能看的很清楚，~~我的修改都被~~这样了。

只能，在 `mounted()` 生命周期中操作 DOM ，选择 Class Name 来进行修改样式，就硬改，还真的有效。

## 第三个坑

改成功了，真开心，好景不长，在我的 `Home` 、 `Blog` 不停的页面切换中，它又回到了起点，样式又出现了问题。:confounded::confounded:

我首先怀疑的是 `mounted()` 是否是在页面的切换之后没有再次执行，因为 `Vue` 中会有这样的问题。如果用了 `keep-alive` 的组件的时候会将状态保留在内存中，防止重复渲染DOM，我此处开了脑洞，我认为 `vuepress` 偷偷地在我看不到的地方用了这个组件来优化显示效果。见招拆招，我就用 `activated()` 生命周期（好像我之前还不知道有这个周期），然而，它并不运行到这个函数，我又试着监听路由变化，此处就不展开了。然后 ... ，我发现，其实，`mounted()` 函数每次切换页面的时候都触发了，真正的问题在于 **更改了某个 DOM 元素之后，而这时候我们想看到这个被改变后的 DOM 是需要 DOM 更新之后才会实现的**，解决办法是使用 `this.$nextTick()` 可以等待 DOM 生成以后再来获取 DOM 对象（可以参考 [Vue.js中this.$nextTick()的使用](https://www.cnblogs.com/jin-zhe/p/9985436.html) ），加上异步 `setTimeout()` ，延迟获取 DOM 的代码的执行。像这样：

```js
mounted() {
    this.$nextTick(() => {
        setTimeout(() => {

            ...
            
        })
    })
}
```

看来还是要搞清楚 `Vue` 中 DOM 的渲染过程。