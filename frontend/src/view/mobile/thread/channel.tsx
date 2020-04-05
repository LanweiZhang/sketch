import React from 'react';
import { Page } from '../../components/common/page';
import { MobileRouteProps } from '../router';
import { NavBar } from '../../components/common/navbar';
import { PublishThreadButton } from '../../components/thread/publish-button';
import { PublishThread } from '../../components/thread/publish-thread';
import { notice } from '../../components/common/notice';

interface Props extends MobileRouteProps {
}

interface State {
  page: 'default' | 'createPost';
}

export class Channel extends React.Component < Props, State > {
  public state:State = {
    page: 'default',
  };

  public render() {
    switch (this.state.page) {
      case 'createPost':
        return <PublishThread
          type={'thread'}
          onCancel={() => this.setState({page: 'default'})}
          onSubmit={(spec) => this.props.core.db.publishThread(spec)
            .then((thread) => {
              notice.success('发布成功');
              this.props.core.route.thread(thread.id);
            })
            .catch((e) => notice.requestError(e))
          }
        />;
      case 'default':
      default:
        return this.renderDefault();
    }
  }
  public renderDefault() {
    return <Page
      top={
        <NavBar goBack = {
          this.props.core.route.back
        }>channel</NavBar>}>

      <PublishThreadButton onClick={() => this.setState({ page: 'createPost'})} />
    </Page>;
  }
}