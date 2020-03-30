import * as React from 'react';
import { Popup } from '../common/popup';
import { Themes } from '../../theme/theme';
import { FontType, loadStorage, saveStorage } from '../../../utils/storage';

interface Props {
    onClose:() => void;
    onConfirm:(theme:Themes) => void;
}

interface State {
    theme:Themes;
    fontSize:number;
    fontType:FontType;
}

export class ReadingSettings extends React.Component<Props, State> {

    constructor(props:Props) {
        super(props);
        // load default settings
        const theme = loadStorage('theme');
        const fontSettings = loadStorage('readingSettings');
        this.state = {
            theme,
            fontSize: fontSettings.fontSize,
            fontType: fontSettings.fontType,
        };
    }

    public onConfirm = () => {
        saveStorage('readingSettings', {
            fontSize: this.state.fontSize,
            fontType: this.state.fontType,
        });
        saveStorage('theme', this.state.theme);
        this.props.onConfirm(this.state.theme);
    }

    public render () {
        return <Popup onClose={this.props.onClose}>

        </Popup>;
    }
}