// loginWidget.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { safeCredentials, handleErrors } from '@utils/fetchHelper';

class LoginWidget extends React.Component {
  state = {
    username: '',
    password: '',
    error: '',
  }

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    })
  }

  login = (e) => {
    if (e) { e.preventDefault(); }
    this.setState({
      error: '',
    });

    fetch('/api/sessions', {
      ...safeCredentials({
        method: 'POST',
        body: JSON.stringify({
          user: {
            username: this.state.username,
            password: this.state.password,
          }
        })
      }),
      credentials: 'include'
    })
      .then(handleErrors)
      .then(data => {
        if (data.success) {
          window.location.reload();
        } else {
          this.setState({ error: 'Invalid username or password' });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  render() {
    const { username, password, error } = this.state;
    return (
      <React.Fragment>
        <form onSubmit={this.login}>
          <input name="username" type="text" className="form-control form-control-lg mb-3" placeholder="Username" value={username} onChange={this.handleChange} required />
          <input name="password" type="password" className="form-control form-control-lg mb-3" placeholder="Password" value={password} onChange={this.handleChange} required />
          <button type="submit" className="btn btn-danger btn-block btn-lg">Log in</button>
          {error && <p className="text-danger mt-2">{error}</p>}
        </form>
        <hr />
        <p className="mb-0">Don't have an account? <a className="text-primary" onClick={this.props.toggle}>Sign up</a></p>
      </React.Fragment>
    )
  }
}

export default LoginWidget