import * as React from 'react';
import { ThreadProfile, ThreadMode } from '../../components/thread/thread-profile';
import { ChapterList } from '../../components/thread/chapter-list';
import { ResData, ReqData } from '../../../config/api';
import { NavBar } from '../../components/common/navbar';
import { MobileRouteProps } from '../router';
import { Page } from '../../components/common/page';
import { Post } from '../../components/thread/post';
import { notice } from '../../components/common/notice';
import { Review } from '../../components/thread/review';
import { Reply } from '../../components/thread/reply';
import { Reward } from '../../components/thread/reward';
import { DBResponse } from '../../../core/db';
import { RoutePath } from '../../../config/route-path';
import { Loading } from '../../components/common/loading';

interface State {
  data:DBResponse<'getThread'|'getThreadProfile'>;
  mode:ThreadMode;
  showReward:boolean;
  page:'review'|'default'|'reply';
  reply_to_post:ResData.Post;
  isLoading:boolean;
}

export class Book extends React.Component<MobileRouteProps, State> {
  public state:State = {
    data: {
      thread: ResData.allocThread(),
      posts: [],
      paginate: ResData.allocThreadPaginate(),
    },
    mode: 'reading',
    showReward: false,
    page: 'review',
    reply_to_post: ResData.allocPost(),
    isLoading: true,
  };

  public async fetchData () {
    try {
      let data;
      switch (this.state.mode) {
        case 'discussion':
          data = await this.props.core.db.getThread(+this.props.match.params.id);
          break;
        case 'reading':
        default:
          data = await this.props.core.db.getThreadProfile(+this.props.match.params.id, {});
          break;
      }
      this.setState({data, isLoading: false});
      this.props.core.state.chapterIndex.threadId = data.thread.id;
      this.props.core.state.chapterIndex.chapters = data.thread.component_index_brief;
    } catch (e) {
      notice.requestError(e);
    }
  }

  public changeMode = (mode:ThreadMode) => {
    this.setState({mode}, () => this.fetchData());
  }

  public async componentDidMount () {
    await this.fetchData();
  }

  public render () {
    switch (this.state.page) {
      case 'review':
        return this.renderReview();
      case 'reply':
        return this.renderReply();
      case 'default':
      default:
        return this.renderBook();
    }
  }

  public renderBook () {
    const { data } = this.state;
    return (
      <Page noTopBorder
        top={
          <NavBar goBack={() => this.props.core.route.go(RoutePath.library)}>
            文章详情
          </NavBar>}
        >

        {this.state.isLoading
        ?
        <Loading />
        :
        <ThreadProfile
          thread={data.thread}
          changeMode={this.changeMode}
          onCollect={() => {
            this.props.core.db.collectThread(data.thread.id)
              .catch(notice.requestError);
          }}
          onReward={() => this.setState({showReward: true})}
          onReview={() => this.setState({page: 'review'})}
          onReply={() => this.setState({page: 'reply'})}
        />
        }

        {this.renderBookMode()}

      </Page>
    );
  }

  public renderBookMode () {
    switch (this.state.mode) {
      case 'discussion':
        return this.renderPosts();
      case 'reading':
      default:
          const { data } = this.state;
          return <>
            <ChapterList
              chapters={data.thread.component_index_brief}
              goChapter={(id) => this.props.core.route.chapter(data.thread.id, id)}
            />

            {this.renderPosts()}

            {this.state.showReward && <Reward
              onClose={() => this.setState({showReward: false})}
              salt={99 /* todo: */}
              fish={99 /* todo: */}
              ham={99 /* todo: */}
              onReward={(type, value) => {
                this.props.core.db.addReward({
                  value,
                  rewardable_type: 'Thread',
                  rewardable_id: data.thread.id,
                  attribute: type,
                })
                .then(() => notice.success('打赏成功'))
                .catch(notice.requestError);
              }}
            />}
          </>;
    }
  }

  public renderPosts () {
    return this.state.data.posts.map((post, i) => <Post
      key={post.id}
      data={post}
      isAuthor={post.author.id === this.state.data.thread.author.id}
      onVote={(attitude) => {
        this.props.core.db.vote(ReqData.Vote.type.post, post.id, attitude)
          .then(() => notice.success('投票成功'))
          .catch(notice.requestError);
      }}
      onReply={() => this.setState({
        page: 'reply',
        reply_to_post: post,
      })}
    />);
  }

  public renderReview () {
    return <Review
      goBack={() => this.setState({page: 'default'})}
      title={this.state.data.thread.attributes.title}
      publish={(data) => {
        this.props.core.db.addPostToThread(this.state.data.thread.id, {
          body: data.body,
          title: data.title,
          use_indentation: data.indent,
          rating: data.rate,
          summary: data.suggest ? 'recommend' : undefined,
          brief: data.brief,
          type: ReqData.Post.Type.review,
          reviewee_type: 'thread',
          reviewee_id: this.state.data.thread.id,
        })
          .then(() => {
            this.setState({page: 'default'});
            notice.success('发表成功');
          })
          .catch(notice.requestError);
      }}
    />;
  }

  public renderReply () {
    const { reply_to_post } = this.state;
    return <Reply
      goBack={() => this.setState({page: 'default'})}
      submit={(body, anonymous) => {
        this.props.core.db.addPostToThread(this.state.data.thread.id, {
          body,
          type: ReqData.Post.Type.post,
          is_anonymous: anonymous || false,
          in_component_id: reply_to_post.id,
          reply_to_id: reply_to_post.id,
          reply_to_brief: reply_to_post.attributes.brief,
        })
          .then(() => {
            this.setState({ page: 'default' });
            notice.success('发表成功');
          })
          .catch(notice.requestError);
      }}
    />;
  }
}