// index.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import EditProperty from './edit_property';

document.addEventListener('DOMContentLoaded', () => {
    const node = document.getElementById('params');
    const data = JSON.parse(node.getAttribute('data-params'));

    ReactDOM.render(
        <EditProperty property_id={data.property_id} />,
        document.body.appendChild(document.createElement('div')),
    )
})