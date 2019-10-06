import React, { Component } from "react";

export default class Select extends Component {

    constructor(props) {
        super(props);

        this.options = this.props.children.map(option =>
            <div key={ option.props.value } value={ option.props.value }
                 class="commonSelect option" onClick={ e => this.choose(e) } >{ option.props.children }</div>
        );

        this.dropDown = React.createRef();

        this.state = { selected: "", selectedName: "Please choose" };

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
        this.dropDown.current.style.display = "block";
    }

    closeDropDown() {
        this.dropDown.current.style.display = "none";
    }

    render() {
        return (
            <div class="select" >
                <select style={{ display: "none" }} >{ this.props.children }</select>
                <div class="commonSelect selectCurrent" onClick={ e => this.openDropDown(e) } >
                    { this.state.selectedName }
                    <i class="fa fa-chevron-down" ></i>
                </div>
                <div ref={this.dropDown} class="options" >{ this.options }</div>
            </div>
        );
    }
}