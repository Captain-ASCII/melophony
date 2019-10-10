import React, { Component } from "react";

export default class Switch extends Component {

    constructor(props) {
        super(props);

        let enabled = !!this.props.active || false;
        let compareValue = true;

        if (this.props.enabledState) {
            compareValue = this.props.enabledState.value;
        }
        if (this.props.configurationSwitch) {
            enabled = configurationManager.get(this.props.configurationSwitch) == compareValue;
        }

        let iconState = "";
        if (this.props.doubleState) {
            iconState = enabled ? `fa-${this.props.enabledState.icon}` : `fa-${this.props.disabledState.icon}`;
        } else {
            iconState = enabled ? `fa-${this.props.icon} active` : `fa-${this.props.icon}`;
        }

        this.state = { active: enabled, iconState: iconState };

        this.shuffleButton = React.createRef();
    }

    onSwitch() {
        let iconState = "", value = "";

        if (this.props.doubleState) {
            iconState = this.state.active ? `fa-${this.props.disabledState.icon}` : `fa-${this.props.enabledState.icon}`;
            value = this.state.active ? this.props.disabledState.value : this.props.enabledState.value;
        } else {
            iconState = this.state.active ? `fa-${this.props.icon}` : `fa-${this.props.icon} active`;
            value = !this.state.active;
        }

        if (this.props.configurationSwitch) {
            configurationManager.set(this.props.configurationSwitch, value);
        }
        if (this.props.onSwitch) {
            this.props.onSwitch(value);
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
