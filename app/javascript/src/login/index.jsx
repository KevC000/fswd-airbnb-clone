import React from 'react'
import ReactDOM from 'react-dom'
import Login from '@src/login/login';
import SignupWidget from '@src/login/signupWidget';

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        <Login />,
        document.body.appendChild(document.createElement('div')),
    )
})