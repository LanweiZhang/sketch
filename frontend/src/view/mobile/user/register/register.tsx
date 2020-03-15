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
import { RegMail1 } from './reg-mail1';

interface State {
  registrationOption:RegistrationOption;
  step:Step;
  email:string;
}

export type RegistrationOption = 'code' | 'mail';

// we put all registration pages in one component,
// and use internal component state to navigate between steps, instead of providing urls for different steps
// thus we can make sure user cannot skip any steps
// and attackers cannot get to final registration page without clicking through all the previous steps
// if user refreshes page, he just has start from the very beginning
export type Step = 'info' | 'choose-reg-option' | 'reg-mail-1';
export class Register extends React.Component<MobileRouteProps, State> {
  public state:State = {
    registrationOption: 'code',
    step: 'info',
    email: '',
  };

  public async componentDidMount() {
  }

  // QUESTION: 像这个情况,type该怎么写呢..
  public updateState = (key:keyof State) => (value:any) => () => {
    this.setState({
      [key]: value,
    } as any);
  }

  public nextStep = () => {
    const { registrationOption, step } = this.state;
    switch (step) {
      case 'info':
        this.setState({ step: 'choose-reg-option' });
        break;
      case 'choose-reg-option':
        this.setState({ step: 'reg-mail-1' });
        break;
      case 'reg-mail-1':
        console.log(111);
        break;
    }
  }

  private getMenuButton() {
    const { registrationOption, step, email } = this.state;
    switch (step) {
      case 'info':
      case 'choose-reg-option':
        return <span>下一步</span>;
      case 'reg-mail-1':
        return <span>提交</span>;
    }
  }

  private getMenuButtonIsInvalid() {
    const { registrationOption, step, email } = this.state;
    if (step == 'reg-mail-1' && !email) { return true; }
    return false;
  }

  private getMenuTitle() {
    const { registrationOption, step } = this.state;
    switch (step) {
      case 'info':
      case 'choose-reg-option':
        return '注册';
      case 'reg-mail-1':
        return '通过邮件注册';
    }
  }

  private getPageContent() {
    const { registrationOption, step, email } = this.state;
    switch (step) {
      case 'info':
        return <PreRegInfo />;
      case 'choose-reg-option':
        return (
          <RegOptions
            regOption={this.state.registrationOption}
            changeRegOption={this.updateState('registrationOption')} />);
      case 'reg-mail-1':
        return (
          <RegMail1
            email={email}
            changeMailAddress={this.updateState('email')}/>);
    }
  }

  public render () {
    return (<Page
        top={<NavBar
          goBack={this.props.core.route.back}
          onMenuClick={this.nextStep}
          menuButton={this.getMenuButton()}
          buttonInvalid={this.getMenuButtonIsInvalid()}>
          {this.getMenuTitle()}
        </NavBar>}>
          {/* <RegMail1 /> */}
          {this.getPageContent()}
      </Page>);
  }
}