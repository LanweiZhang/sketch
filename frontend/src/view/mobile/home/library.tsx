import * as React from 'react';
import { Page } from '../../components/common/page';
import { NavBar } from '../../components/common/navbar';
import { RoutePath } from '../../../config/route-path';
import { ForumMenu } from '../../components/thread/forum-menu';
import { ReqData, ResData } from '../../../config/api';
import { MobileRouteProps } from '../router';
import { ThreadPreview } from '../../components/thread/thread-preview';
import { DBResponse } from '../../../core/db';
import { Loading } from '../../components/common/loading';

interface State {
  data:DBResponse<'getBooks'>;
  onPage:number;
  ordered:ReqData.Thread.ordered;
  isLoading:boolean;
}

export class Library extends React.Component<MobileRouteProps, State> {
  public state:State = {
    data: {
      threads: [],
      paginate: ResData.allocThreadPaginate(),
    },
    onPage: 1,
    ordered: ReqData.Thread.ordered.default,
    isLoading: true,
  };

  public componentDidMount() {
    this.fetchData();
  }

  public fetchData () {
    const { tag, channel, bianyuan } = this.props.core.filter;
    this.props.core.db.getBooks({
      page: this.state.onPage,
      channel: channel.getSelectedList(),
      withTag: [tag.getSelectedList()],
      withBianyuan: bianyuan.isSelected(1),
      ordered: this.state.ordered,
    })
    .then((data) => this.setState({data, isLoading: false}))
    .catch(console.error);
  }

  public render () {
    return <Page top={<NavBar
      goBack={() => this.props.core.route.go(RoutePath.home)}
      menu={NavBar.MenuIcon({
        onClick: () => this.props.core.route.go(RoutePath.search),
        icon: 'fa fa-search',
      })}
    >文库</NavBar>}>
      <ForumMenu
        core={this.props.core}
        selectedSort={ReqData.Thread.ordered.default}
        applySort={(ordered) => {
          this.setState({ordered});
          this.fetchData();
        }}
        applyFilter={() => this.fetchData()}
      />
      {this.state.isLoading
      ?
      <Loading />
      :
      this.state.data.threads.map((thread) => <ThreadPreview
        key={thread.id}
        data={thread}
        onTagClick={(channelId, tagId) => {}}
        onClick={(id) => this.props.core.route.book(id)}
        onUserClick={(id) => this.props.core.route.user(id)}
      />)
      }
    </Page>;
  }
}