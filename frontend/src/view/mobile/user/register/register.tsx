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
import { RegMail2 } from './reg-mail2';
import { RegMail3 } from './reg-mail3';
import { RegisterByInvitationEmail } from './sampleData';
import { RegMail4 } from './reg-mail4';
import { Popup } from '../../../components/common/popup';
import { RegMail4Confirm } from './reg-mail4-confirm';

const regMailTokenLength = 10;
const essayMinLength = 500;

export type QuizAnswer = {[key:number]:number};
interface State {
  registrationOption:RegistrationOption;
  step:Step;
  email:string;
  quizAnswer:QuizAnswer;
  regMailToken:string;
  essayAnswer:string;
  showPopup:boolean;
}

export type RegistrationOption = 'code' | 'mail';

// we put all registration pages in one component,
// and use internal component state to navigate between steps, instead of providing urls for different steps
// thus we can make sure user cannot skip any steps
// and attackers cannot get to final registration page without clicking through all the previous steps
// if user refreshes page, he just has start from the very beginning
export type Step = 'info' | 'choose-reg-option' | 'reg-mail-1' |
  'reg-mail-2' | 'reg-mail-3' | 'reg-mail-4';

const quiz = RegisterByInvitationEmail.data.quizzes as ResData.QuizQuestion[];

export class Register extends React.Component<MobileRouteProps, State> {
  public state:State = {
    registrationOption: 'code',
    step: 'info',
    email: '',
    quizAnswer:{},      // reg-mail2
    regMailToken: '',   // reg-mail3
    essayAnswer: '',
    showPopup:false,
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
        // TODO: serverl branches here
        this.setState({ step: 'reg-mail-2' });
        break;
      case 'reg-mail-2':
        // TODO: submit quiz
        this.setState({ step: 'reg-mail-3' });
        break;
      case 'reg-mail-3':
        this.setState({ step: 'reg-mail-4' });
        console.log(222);
        break;
      case 'reg-mail-4':
        console.log(1);
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
      case 'reg-mail-2':
        return <span>提交</span>;
      case 'reg-mail-3':
        return <span>确认</span>;
      case 'reg-mail-4':
        return <span>提交</span>;
    }
  }

  private getMenuButtonIsInvalid() {
    const { registrationOption, step, email, quizAnswer, regMailToken, essayAnswer } = this.state;
    if (step == 'reg-mail-1' && !email) { return true; }
    if (step == 'reg-mail-2') {
      if (!email) { return true; }
      if (Object.keys(quizAnswer).length != quiz.length) { return true; }
    }
    if (step == 'reg-mail-3' &&
      regMailToken.length != regMailTokenLength) {
        return true;
    }
    if (step == 'reg-mail-4' && essayAnswer.length < essayMinLength) {
      return true;
    }
    return false;
  }

  private getMenuTitle() {
    const { registrationOption, step } = this.state;
    switch (step) {
      case 'info':
      case 'choose-reg-option':
        return '注册';
      case 'reg-mail-1':
      case 'reg-mail-2':
      case 'reg-mail-3':
      case 'reg-mail-4':
        return '通过邮件注册';
    }
  }

  private getPageContent() {
    const { registrationOption, step, email, quizAnswer, essayAnswer } = this.state;
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
      case 'reg-mail-2':
        return (
          <RegMail2
            email={email}
            quizAnswer={quizAnswer}
            changeQuizAnswer={this.updateState('quizAnswer')}
          />
        );
      case 'reg-mail-3':
        return (
          <RegMail3
            regMailToken={this.state.regMailToken}
            changeRegMailToken={this.updateState('regMailToken')}
            email={email}/>
        );
      case 'reg-mail-4':
        return (
          <RegMail4
            email={email}
            essayAnswer={essayAnswer}
            changeEssayAnswer={this.updateState('essayAnswer')}/>
        );
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
        {/* <RegMail4
            email={this.state.email}
            essayAnswer={this.state.essayAnswer}
            changeEssayAnswer={this.updateState('essayAnswer')}/> */}

            {this.getPageContent()}

            {this.state.showPopup && <Popup
              className="reg"
              onClose={() => {}}>
              <RegMail4Confirm onClick={() => console.log(1)}/>
            </Popup>}
      </Page>);
  }
}