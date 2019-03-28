// 路由复用钩子
export function beforeRouteUpdate (to, from, next) {
  const { asyncData } = this.$options
  if (asyncData) {
    asyncData({
      store: this.$store,
      route: to
    }).then(next).catch(next)
  } else {
    next()
  }
}

// 全局路由切换前钩子
export function beforeResolve(router, store) {
  return function (to, from, next) {
    const matched = router.getMatchedComponents(to)
    const prevMatched = router.getMatchedComponents(from)

    // 我们只关心非预渲染的组件
    // 所以我们对比它们，找出两个匹配列表的差异组件
    let diffed = false
    const activated = matched.filter((c, i) => {
      return diffed || (diffed = (prevMatched[i] !== c))
    })

    if (!activated.length) {
      return next()
    }

    // 这里如果有加载指示器(loading indicator)，就触发

    Promise.all(activated.map(c => {
      if (c.asyncData) {
        return c.asyncData({ store, route: to })
      }
    })).then(() => {
      // 停止加载指示器(loading indicator)
      next()
    }).catch(next)
  }
}