import React, { Component } from "react";

export default class TextInput extends Component {

    constructor(props) {
        super(props);

        this.input = React.createRef();
    }

    reset() {
        this.input.current.value = "";
        this.props.onInput("");
    }

    render() {
        return (
            <div class="text-input">
                <i class={`fa fa-${this.props.icon} icon`}></i>
                <input ref={this.input} id={`${this.props.id}`} type="text" onInput={ e => this.props.onInput(e.target.value) } />
                <i class="fa fa-times icon clear-icon button" onClick={ _ => this.reset() } ></i>
            </div>
        );
    }
}
