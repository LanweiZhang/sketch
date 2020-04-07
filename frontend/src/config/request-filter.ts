export namespace RequestFilter {
  // from backend/config/selectors.php
  export namespace thread {
    export enum isPublic {
      include_private = 'include_private', // 包含未公开
      private_only = 'private_only', // 只看未公开
    }
    export enum ordered {
      default = 'default', // 最后回复
      latest_add_component = 'latest_add_component', // 最新更新
      total_char = 'total_char', // 总字数
      jifen = 'jifen', // 总积分
      weighted_jifen = 'weighted_jifen', // 均字数积分
      latest_created = 'latest_created', // 最新创建
      collection_count = 'collection_count', // 最多收藏
      random = 'random', // 随机乱序
    }
    export enum withBianyuan {
      include_bianyuan = 'include_bianyuan', // 包含边限
      bianyuan_only = 'bianyuan_only', // 只看边限
    }
  }

  export namespace book {
    export enum inChannel {
      yuanchuang = '1', // 原创小说
      tongren = '2', // 同人小说
    }
    export enum ordered {
      default = 'default', // 最后回复
      latest_add_component = 'latest_add_component', // 最新更新
      total_char = 'total_char', // 总字数
      jifen = 'jifen', // 总积分
      weighted_jifen = 'weighted_jifen', // 均字数积分
      latest_created = 'latest_created', // 最新创建
      collection_count = 'collection_count', // 最多收藏
      random = 'random', // 随机乱序
    }
  }

  export namespace list {
    export enum withType {
      post = 'post', // 只看回帖
      review = 'review', // 只看书评
    }
    export enum withComponent {
      component_only = 'component_only', // 只显示书评
      post_N_comment = 'post_N_comment', // 只显示回帖和点评
      include_comment = 'include_comment', // 显示点评
    }
    export enum withFolded {
      include_folded = 'include_folded', // 显示折叠内容
    }
    export enum ordered {
      default = 'default', // 最早发布
      latest_created = 'latest_created', // 最新发布
      most_upvoted = 'most_upvoted', // 最高赞
    }
  }

  export namespace box {
    export enum withType {
      post = 'post', // 只看回帖
      question = 'question', // 只看提问
      answer = 'answer', // 只看回答
    }
    export enum withComponent {
      component_only = 'component_only', // 只显示问
      post_N_comment = 'post_N_comment', // 只显示回帖和点评
      include_comment = 'include_comment', // 显示点评
    }
    export enum withFolded {
      include_folded = 'include_folded', // 显示折叠内容
    }
    export enum ordered {
      default = 'default', // 时间顺序
      latest_created = 'latest_created', // 最新发布
      most_upvoted = 'most_upvoted', // 最高赞
    }
  }

  export namespace homework {
    export enum withType {
      post = 'post', // 回帖
      work = 'work', // 作业正文
      critique = 'critique', // 作业批评
    }
    export enum withComponent {
      include_comment = 'include_comment', // 显示点评
    }
    export enum withFolded {
      include_folded = 'include_folded', // 显示折叠内容
    }
    export enum ordered {
      default = 'default', // 最早回复
      latest_created = 'latest_created', // 最新发布
      most_upvoted = 'most_upvoted', // 最高赞
    }
  }

  export namespace collection {
    export enum order_by {
      collect = '0', // 最新收藏
      reply = '1', // 最新回复
      chapter = '2', // 最新章节
      created = '3', // 最新创立
    }
  }

  export namespace review {
    export enum reviewType {
      all = 'all', // 全部书评
      sosad_only = 'sosad_only', // 站内文评
      none_sosad_only = 'none_sosad_only', // 非站内文评
    }
    export enum withLength {
      short = 'short', // 短评
      medium = 'medium', // 中评
      long = 'long', // 长评
      no_limit = 'no_limit', // 不限长度
    }
    export enum reviewRecommend {
      recommend_only = 'recommend_only', // 推荐
      none_recommend_only = 'none_recommend_only', // 未推荐
    }
    export enum reviewEditor {
      editor_only = 'editor_only', // 编推
      none_editor_only = 'none_editor_only', // 非编推
    }
    export enum ordered {
      default = 'default', // 最早回复
      latest_created = 'latest_created', // 最新发布
      most_upvoted = 'most_upvoted', // 最高赞
    }
  }
}