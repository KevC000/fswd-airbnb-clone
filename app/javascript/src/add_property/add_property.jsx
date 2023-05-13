// property.jsx
import React from 'react';
import Layout from '@src/layout';
import { handleErrors } from '@utils/fetchHelper';

import './add_property.scss';

class AddProperty extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      property: {
        title: '',
        description: '',
        city: '',
        country: '',
        property_type: '',
        price_per_night: 0,
        max_guests: 0,
        bedrooms: 0,
        beds: 0,
        baths: 0,
        user_id: null,
      },
      image: null,
      loading: true,
      user: null,
      previewImage: null
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.addProperty = this.addProperty.bind(this);
  }


  addProperty() {
    const csrfToken = document.querySelector('[name="csrf-token"]').content;
    const formData = new FormData();

    if (this.state.image) {
      formData.append('property[image]', this.state.image);
    }

    Object.keys(this.state.property).forEach((key) => {
      formData.append(`property[${key}]`, this.state.property[key]);
    });

    fetch(`/api/properties/create`, {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    })
      .then(handleErrors)
      .then((data) => {
        window.location.href = '/';
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
  }

  fetchAuthenticatedUser = async () => {
    try {
      const response = await fetch('/api/authenticated');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  handleInputChange(event) {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      property: {
        ...prevState.property,
        [name]: value,
      },
    }));
  }

  previewImage(file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      this.setState({ previewImage: reader.result });
    };
    reader.readAsDataURL(file);
  }

  handleFileChange = (e) => {
    const file = e.target.files[0];
    this.setState({ image: file });
    this.previewImage(file);
  };


  componentDidMount() {
    this.fetchAuthenticatedUser()
      .then((data) => {
        if (data && data.user) {
          this.setState((prevState) => ({
            property: {
              ...prevState.property,
              user_id: data.user.id,
            },
            loading: false, // Add this line to update the loading state
          }));
        } else {
          this.setState({ loading: false }); // Add this line to update the loading state if there is no user data
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        this.setState({ loading: false }); // Add this line to update the loading state in case of an error
      });
  }

  render() {
    const { property, images, loading, user, previewImage } = this.state;

    if (loading) {
      return <Layout>Loading...</Layout>; // Added Layout component here
    }

    const {
      id,
      title,
      description,
      city,
      country,
      property_type,
      price_per_night,
      max_guests,
      bedrooms,
      beds,
      baths,
      image_url,
      user_id,
    } = property

    return (
      <Layout>
        <div
          className="property-image mb-3"
          style={{ backgroundImage: `url(${previewImage})` }}
        />
        <div className="container">
          <div className="row">
            <div className="info col-12 col-lg-7">
              <input
                type="file"
                name="images"
                multiple
                onChange={this.handleFileChange}
                ref={(input) => (this.fileInput = input)}
                style={{ display: "none" }}
              />

              <button
                type="button"
                className="btn btn-large btn-danger btn-block mb-0"
                onClick={() => this.fileInput.click()}
              >
                Upload Image
              </button>
              <div className="mb-3">
                <h4>Title</h4>
                <input name="title" type="text" className="mb-0" value={title} onChange={this.handleInputChange} />
                <h4>Country</h4>
                <input name="country" type="text" className="mb-0" value={country} onChange={this.handleInputChange} />
                <h4>City</h4>
                <input name="city" type="text" className="mb-0" value={city} onChange={this.handleInputChange} />
              </div>
              <div>
                <h4>Property Type</h4>
                <input name="property_type" type="text" className="mb-0" value={property_type} onChange={this.handleInputChange} />
                <h4>Max Guest</h4>
                <input name="max_guests" type="number" className="mb-0" value={max_guests} onChange={this.handleInputChange} />
                <h4>Bedrooms</h4>
                <input name="bedrooms" type="number" className="mb-0" value={bedrooms} onChange={this.handleInputChange} />
                <h4>Bed</h4>
                <input name="beds" type="number" className="mb-0" value={beds} onChange={this.handleInputChange} />
                <h4>Baths</h4>
                <input name="baths" type="number" className="mb-0" value={baths} onChange={this.handleInputChange} />
                <h4>Price Per Night</h4>
                <input name="price_per_night" type="number" className="mb-0" value={price_per_night} onChange={this.handleInputChange} />
              </div>
              <hr />
              <h4>Description</h4>
              <input name="description" value={description} type="text" onChange={this.handleInputChange} />
              <div>
                <button className="btn btn-large btn-danger btn-block m-3" onClick={this.addProperty}>Add</button>
                <a className="btn btn-large btn-danger btn-block m-3" href="/">Cancel</a>
              </div>
            </div>
          </div>
        </div>
      </Layout >
    )
  }
}

export default AddProperty