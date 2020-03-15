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
import { RegOptions } from './reg-options';

interface State {
  registrationOption:RegistrationOption;
  step:Step;
}

export type RegistrationOption = 'code' | 'mail';

// we put all registration pages in one component,
// and use internal component state to navigate between steps, instead of providing urls for different steps
// thus we can make sure user cannot skip any steps
// and attackers cannot get to final registration page without clicking through all the previous steps
// if user refreshes page, he just has start from the very beginning
export type Step = 'info' | 'choose-reg-option';
export class Register extends React.Component<MobileRouteProps, State> {
  public state:State = {
    registrationOption: 'code',
    step: 'info',
  };

  public async componentDidMount() {
  }

  public changeRegOption = (o:RegistrationOption) => () => {
    this.setState({
      registrationOption: o,
    });
  }

  public nextStep = () => {
    const { registrationOption, step } = this.state;
    switch (step) {
      case 'info':
        this.setState({ step: 'choose-reg-option'});
        break;
      case 'choose-reg-option':
        // const url = registrationOption == 'code' ? '/register/code' : '/register/mail';
        // this.props.history.push('/');
        break;
    }
  }

  private getMenuButton() {
    const { registrationOption, step } = this.state;
    switch (step) {
      case 'info':
      case 'choose-reg-option':
        return <span className="nav-button">下一步</span>;
    }
  }

  private getMenuTitle() {
    const { registrationOption, step } = this.state;
    switch (step) {
      case 'info':
      case 'choose-reg-option':
        return '注册';
    }
  }

  private getPageContent() {
    const { registrationOption, step } = this.state;
    switch (step) {
      case 'info':
        return <PreRegInfo />;
      case 'choose-reg-option':
        return (
          <RegOptions
            regOption={this.state.registrationOption}
            changeRegOption={this.changeRegOption} />);
    }
  }

  public render () {
    return (<Page
        top={<NavBar
          goBack={this.props.core.route.back}
          onMenuClick={this.nextStep}
          menuButton={this.getMenuButton()}>
          {this.getMenuTitle()}
        </NavBar>}>
          {this.getPageContent()}
      </Page>);
  }
}