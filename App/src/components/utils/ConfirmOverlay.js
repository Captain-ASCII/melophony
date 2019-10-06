import React, { Component } from "react";

export default class ConfirmOverlay extends Component {

    constructor(props) {
        super(props);

        this.state = { confirmMessage: "Are you sure ?" };

        actionManager.expose("ConfirmOverlay", this, this.displayConfirmation);

        this.overlay = React.createRef();
    }

    displayConfirmation(message, callback) {
        this.setState({ confirmMessage: message, confirmCallback: callback });

        this.overlay.current.style.display = "flex";
    }

    closeConfirmation() {
        this.overlay.current.style.display = "none";
    }

    cancel() {
        this.closeConfirmation();
    }

    confirm() {
        this.state.confirmCallback();
        this.closeConfirmation();
    }

    render() {
        return (
            <div ref={this.overlay} id="overlay">
                <div id="overlayBox">
                    <p id="confirmMessage" >{ this.state.confirmMessage }</p>
                    <div id="confirmActionBox">
                        <div id="cancelButton" class="button raised" onClick={ _ => this.cancel() } >No</div>
                        <div id="confirmButton" class="button raised" onClick={ _ => this.confirm() } >Yes</div>
                    </div>
                </div>
            </div>
        );
    }
}