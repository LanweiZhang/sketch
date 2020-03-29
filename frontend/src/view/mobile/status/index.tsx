import * as React from 'react';
import { MobileRouteProps } from '../router';
import { List } from '../../components/common/list';
import  './status.scss';
// 等后续用api直接替换
import data from './data';
import { Page } from '../../components/common/page';
import { MainMenu } from '../main-menu';
import { SearchBar } from '../search/search-bar';
import { TextEditor } from '../../components/common/textEditor';
import { Button } from '../../components/common/button';
import { Colors } from '../../theme/theme';

interface State {
  list:any;
  isAll:boolean;
  publishDisabled:boolean;
}

export class Status extends React.Component<MobileRouteProps, State> {
  public state:State = {
    isAll: true,
    list: data,
    publishDisabled: true,
};
private textEditorRef = React.createRef<TextEditor>();

public getPushlishDisabled = () => {
  const ref = this.textEditorRef.current;
  const publishDisabled = !ref || ref.state.text.length == 0
      || ref.state.text == '<p><br></p>';
  // FIXME: empty state of text editor is p br p sometimes.
  if (publishDisabled != this.state.publishDisabled) {
      this.setState({publishDisabled});
  }
}

public setFilter = (isAll:boolean) => () => {
  if (isAll == this.state.isAll) {
    return;
  } else {
    this.setState({isAll});
  }
}

public render () {
  const { publishDisabled } = this.state;
  return (
      <Page bottom={<MainMenu />} className="mobile-status">
        <SearchBar core={this.props.core} />
        <div id="compose-status">
          <TextEditor
            onChange={this.getPushlishDisabled}
            ref={this.textEditorRef}
            placeholder="今天你丧了吗…"/>
          <div className="publish-btn">
            <Button size="small" disabled={publishDisabled} color={Colors.light} inline={true} onClick={() => console.log(1)}>发布</Button>
          </div>
        </div>
        <div className="content">
          <div className="tiddings-tabs">
            <button className={ this.state.isAll ? 'tab-btn tab-btn-active' : 'tab-btn' }
              onClick={this.setFilter(true)}>
                全部
            </button>
            <button className={ !this.state.isAll ? 'tab-btn tab-btn-active' : 'tab-btn' }
              onClick={this.setFilter(false)}>
                关注
            </button>
          </div>
          <List> {this.renderList()} </List>
        </div>
      </Page>
    );
  }

  // 根据获取的动态信息渲染列表
  public renderList () {
    return data.map((msg, i) => {
      return (
        <List.Item key={ msg.id } className="status-item">
            <div className="status-author">
              <span>{msg.author}</span>
              <span>{msg.time}</span>
            </div>
            <div className="status-content">
              {msg.message}
            </div>
          </List.Item>
      );
    });
  }

  public async handleClick (isAll:boolean) {
    // TODO 确定api如何交互后修改
    // await this.getTidingsList().then(res => {
    //   this.setState((preState) => ({
    //     list: res
    //   }))
    // })
  }

  // 获取消息列表
  public getTidingsList () {}

}