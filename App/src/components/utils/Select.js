import React, { Component } from "react";

import Utils from "../../utils/Utils";

export default class Select extends Component {

    constructor(props) {
        super(props);

        this.options = this.props.children.map(option =>
            <div key={ option.props.value } value={ option.props.value }
                 class="commonSelect option" onClick={ e => this.choose(e) } >{ option.props.children }</div>
        );

        this.optionsId = Utils.generateId();

        this.state = { selected: "", selectedName: this.props.placeholder || "..." };

        document.addEventListener("click", _ => this.closeDropDown());
    }

    choose(event) {
        event.nativeEvent.stopImmediatePropagation();
        this.setState({ selected: event.target.getAttribute("value"), selectedName: event.target.innerHTML });
        this.closeDropDown();

        if (this.props.onSelection) {
            this.props.onSelection(event.target.getAttribute("value"));
        }
    }

    openDropDown(event) {
        event.nativeEvent.stopImmediatePropagation();
        let options = document.getElementById(this.optionsId);
        if (options) {
            options.style.display = "block";
        }
    }

    closeDropDown() {
        let options = document.getElementById(this.optionsId);
        if (options) {
            options.style.display = "none";
        }
    }

    render() {
        return (
            <div class="select" >
                <select style={{ display: "none" }} >{ this.props.children }</select>
                <div class="commonSelect selectCurrent" onClick={ e => this.openDropDown(e) } >
                    { this.props.icon ? <i class={`fa fa-${this.props.icon}`} ></i> : false }
                    { this.state.selectedName }
                    <i class="fa fa-chevron-down" ></i>
                </div>
                <div id={this.optionsId} class="options" >{ this.options }</div>
            </div>
        );
    }
}