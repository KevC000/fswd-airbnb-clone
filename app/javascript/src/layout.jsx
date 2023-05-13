import React from 'react';
import { handleErrors } from '@utils/fetchHelper';

class Layout extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoggedIn: false,
        };
    }

    logout = async () => {
        const response = await fetch('/api/logout', { method: 'GET' });

        if (response.ok) {
            this.setState({ isLoggedIn: false });
            window.location.href = '/';  // Redirect to root URL
        } else {
            console.error('Logout failed');
        }
    };

    login = async (username, password) => {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();

            if (data.authenticated) {
                this.setState({ isLoggedIn: true });
                window.location.href = '/';  // Redirect to root URL
            } else {
                console.error('Login failed');
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    componentDidMount() {
        fetch('/api/authenticated')
            .then(handleErrors)
            .then(data => {
                this.setState({
                    authenticated: data.authenticated,
                    isLoggedIn: data.authenticated
                })
            })
    }


    render() {
        return (
            <React.Fragment>
                <nav className="navbar navbar-expand navbar-light bg-light">
                    <div className="container-fluid">
                        <a className="navbar-brand text-danger" href="/">Airbnb</a>
                        <div className="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul className="navbar-nav me-auto">
                                <li className="nav-item">
                                    <a className="nav-link" href="/">Home</a>
                                </li>
                                {this.state.isLoggedIn && (
                                    <li className="nav-item">
                                        <a className="nav-link" href="/bookings">Bookings</a>
                                    </li>
                                )}
                            </ul>
                            <ul className="navbar-nav ml-auto">
                                {this.state.isLoggedIn ? (
                                    <li className="nav-item ">
                                        <a className="nav-link btn btn-danger btn-block mb-0 text-light" onClick={this.logout}>Logout</a>
                                    </li>
                                ) : (
                                    <li className="nav-item">
                                        <a className="nav-link btn btn-danger btn-block mb-0 text-light" href="/login">Login</a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </nav>
                {this.props.children}
                <footer className="p-3 bg-light">
                    <div>
                        <p className="me-3 mb-0 text-secondary">Airbnb Clone</p>
                    </div>
                </footer>
            </React.Fragment>
        );
    }
}

export default Layout;
