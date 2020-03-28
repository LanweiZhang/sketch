import * as React from 'react';
import { Page } from '../common/page';
import { NavBar } from '../common/navbar';
import { Mark } from '../common/mark';
import './review.scss';
import { TextEditor } from '../common/textEditor';

export type RewardData = {
    title:string;
    brief:string;
    rate:number; // 评分, 1-10
    suggest:boolean; //向他人推荐
    body:string;
    indent:boolean; //首段缩进
};

interface Props {
    goBack:() => void;
    publish:(data:RewardData) => void;
    title:string;
}

interface State extends RewardData {
    publishDisabled:boolean;
}

export class Review extends React.Component<Props, State> {
    public state:State = {
        title: '',
        brief: '',
        rate: 0,
        suggest: false,
        body: '',
        indent: false,
        publishDisabled: false,
    };
    private textEditorRef = React.createRef<TextEditor>();
    public render () {
        const { indent , title, brief} = this.state;
        return <Page top={
            <NavBar goBack={this.props.goBack}
                menu={NavBar.MenuText({
                    onClick: () => this.props.publish(this.state),
                    value: '发布',
                    disabled: this.state.publishDisabled,
                })}
            >
                评《{this.props.title}》
            </NavBar>
        }>
            <div className="review">
                <div className="section">
                    <div className="section-title">标题</div>
                    <div className="input-text">
                        <input type="text"
                            value={title}
                            onChange={(e) => this.setState({title: e.target.value})}
                            placeholder="选填，25字以内"/>
                    </div>
                </div>
                <div className="section">
                    <div className="section-title">概要</div>
                    <div className="input-text">
                        <input type="text"
                            value={brief}
                            onChange={(e) => this.setState({brief: e.target.value})}
                            placeholder="选填，40字以内"/>
                    </div>
                    <p className="left-margin small-warning">标题及概要中不得具有性描写、性暗示，不得使用直白的脏话、黄暴词和明显涉及边缘的词汇。</p>
                </div>
                <div className="section">
                    <div className="section-title">评分</div>
                    <Mark className="left-margin" length={5}/>
                    {/* TODO: use component checkbox */}
                    <span id="recommend-to-others">
                        <input type="checkbox"/>
                        <label>向他人推荐</label>
                    </span>
                </div>
                <div className="section">
                    <div className="section-title">正文</div>
                    {/* TODO: cache unfinished review */}
                    <TextEditor
                        ref={this.textEditorRef}
                        placeholder="为文章写评吧"/>
                    <div className="left-margin section-item">
                        <input
                            type="checkbox"
                            checked={indent}
                            onChange={() => this.setState({indent: !indent})} />
                        <label>段首缩进（每段前两个空格）</label>
                    </div>
                </div>
            </div>
        </Page>;
    }
}