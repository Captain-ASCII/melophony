import React, { Component } from "react";

export default class Switch extends Component {

    constructor(props) {
        super(props);

        let enabled = this.props.active;
        if (this.props.configurationSwitch) {
            enabled = configurationManager.get(this.props.configurationSwitch);
        }

        this.state = { active: enabled };

        this.shuffleButton = React.createRef();
    }

    onSwitch() {
        if (this.state.active) {
            this.shuffleButton.current.classList.remove("active");
        } else {
            this.shuffleButton.current.classList.add("active");
        }

        if (this.props.configurationSwitch) {
            configurationManager.set(this.props.configurationSwitch, !configurationManager.get(this.props.configurationSwitch));
        }
        if (this.props.onSwitch) {
            this.props.onSwitch(!this.state.active);
        }
        this.setState({ active: !this.state.active });
    }

    render() {
        return (
            <i ref={this.shuffleButton} class={`fa fa-${ this.props.icon } icon button ${ this.state.active ? "active" : "" }`}
               onClick={ _ => this.onSwitch() } title={ this.props.title } ></i>
        );
    }
}
