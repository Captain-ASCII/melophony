import React, { Component } from "react";

export default class Switch extends Component {

    constructor(props) {
        super(props);

        let enabled = this.props.active || false;
        if (this.props.configurationSwitch) {
            enabled = configurationManager.get(this.props.configurationSwitch);
        }

        let iconState = this.props.doubleState ? (enabled ? `fa-${this.props.icon2}` : `fa-${this.props.icon}`) : (enabled ? `fa-${this.props.icon} active` : this.props.icon);
        console.warn(enabled);

        this.state = { active: enabled, iconState: iconState };

        this.shuffleButton = React.createRef();
    }

    onSwitch() {
        let iconState = this.props.doubleState ? (this.state.active ? `fa-${this.props.icon}` : `fa-${this.props.icon2}`) : (this.state.active ? `fa-${this.props.icon} active` : this.props.icon);

        if (this.props.configurationSwitch) {
            configurationManager.set(this.props.configurationSwitch, !configurationManager.get(this.props.configurationSwitch));
        }
        if (this.props.onSwitch) {
            this.props.onSwitch(!this.state.active);
        }
        this.setState({ active: !this.state.active, iconState: iconState });
    }

    render() {
        return (
            <i ref={this.shuffleButton} class={`fa ${ this.state.iconState } icon button`}
               onClick={ _ => this.onSwitch() } title={ this.props.title } ></i>
        );
    }
}
