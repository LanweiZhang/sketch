import * as React from 'react';
import { API, ResData, ReqData } from '../../../../config/api';
import { MobileRouteProps } from '../../router';
import { Page } from '../../../components/common/page';
import { NavBar } from '../../../components/common/navbar';
import { List } from '../../../components/common/list';
import { RoutePath } from '../../../../config/route-path';
import { Menu, MenuItem } from '../../../components/common/menu';
import { PreRegInfo } from './pre-reg-info';
import '../../message/style.scss';  // TODO: extract common css
import './style.scss';

interface State {
}

export class Register extends React.Component<MobileRouteProps, State> {
  public state:State = {
  };

  public async componentDidMount() {
  }

  public render () {
    return (<Page
        top={<NavBar
          goBack={this.props.core.route.back}
          onMenuClick={() => console.log('open setting')}
          menuButton={<span className="nav-button">下一步</span>}>
          {/* <MessageMenu/> */}
          注册
        </NavBar>}>
          <PreRegInfo />
      </Page>);
  }
}