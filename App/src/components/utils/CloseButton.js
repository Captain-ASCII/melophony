import React from "react";

import { useHistory } from "react-router-dom";

export default function CloseButton() {
    let history = useHistory();

    return (<div id="backButton" class="button icon" onClick={ _ => history.goBack() } ><i class="fa fa-times fa-2x icon"></i></div>);
}