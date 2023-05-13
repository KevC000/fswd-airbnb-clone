// home.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import Layout from '@src/layout';
import { handleErrors } from '@utils/fetchHelper';

import './home.scss';

class Home extends React.Component {
  state = {
    properties: [],
    total_pages: null,
    next_page: null,
    loading: false,
  }

  componentDidMount() {
    this.setState({ loading: true });
    fetch('/api/properties')
      .then((response) => response.json())
      .then((data) => {
        if (data && data.properties) {
          this.setState({ properties: data.properties, loading: false });
        } else {
          this.setState({ properties: [], loading: false });
        }
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
        this.setState({ properties: [], loading: false });
      });
  }

  render() {
    const { properties, next_page, loading } = this.state;

    if (loading) {
      return (
        <Layout>
          <div className="container pt-4">
            <p>Loading...</p>
          </div>
        </Layout>
      );
    }

    console.log('Properties to render:', properties);

    return (
      <Layout isLoggedIn={this.state.isLoggedIn}>
        <div className="container pt-4">
          <h4 className="mb-1">Top-rated places to stay</h4>
          <p className="text-secondary mb-3">Explore some of the best-reviewed stays in the world</p>
          <a className="btn btn-large btn-danger btn-block my-4" href={`/property/add`}>Add</a>
          <div className="row">
            {properties && properties.map((property) => {
              const imageUrl = property.image_url;
              console.log('Property ID:', property.id);
              console.log('Image URL:', imageUrl);
              return (
                <div key={property.id} className="col-6 col-lg-4 mb-4 property" >
                  <a href={`/property/${property.id}`} className="text-body text-decoration-none">
                    {<div className="property-image mb-3" style={{ backgroundImage: `url(${imageUrl})` }} />}
                  </a>
                  <p className="text-uppercase mb-0 text-secondary"><small><b>{property.city}</b></small></p>
                  <h6 className="mb-0">{property.title}</h6>
                  <p className="mb-0"><small>${property.price_per_night} USD/night</small></p>
                  <a className="btn btn-large btn-danger btn-block mb-0" href={`/property/${property.id}/edit`}>Edit</a>
                </div>
              )
            })}
            {properties && properties.length === 0 && <p>No properties found.</p>}
          </div>
          {loading && <p>loading...</p>}
        </div>
      </Layout>
    )
  }
}

export default Home;

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Home />,
    document.body.appendChild(document.createElement('div')),
  )
})