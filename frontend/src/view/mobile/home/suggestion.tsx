import React from 'react';
import { MobileRouteProps } from '../router';
import { Page } from '../../components/common/page';
import { NavBar } from '../../components/common/navbar';
import { RoutePath } from '../../../config/route-path';
import { DBResponse } from '../../../core/db';

interface State {
  data:DBResponse<'getPageHome'>;
}

export class Suggestion extends React.Component<MobileRouteProps, State> {
  public render () {
    return (
      <Page top={<NavBar
        goBack={() => this.props.core.route.back()}
        menu={NavBar.MenuIcon({
          onClick: () => this.props.core.route.go(RoutePath.search),
          icon: 'fa fa-search',
        })}>
          推荐
        </NavBar>}>
      </Page>);
  }
}