// property.jsx
import React from 'react';
import Layout from '@src/layout';
import { handleErrors } from '@utils/fetchHelper';

import './edit_property.scss';

class EditProperty extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      property: {},
      loading: true,
      previewImage: null,
    };


    this.handleInputChange = this.handleInputChange.bind(this);
    this.updateProperty = this.updateProperty.bind(this);
  }

  updateProperty() {
    console.log('formData:', formData);

    const csrfToken = document.querySelector('[name="csrf-token"]').content;
    const formData = new FormData();

    if (this.state.previewImage) {
      formData.append('property[image]', this.state.previewImage);
    }

    Object.keys(this.state.property).forEach((key) => {
      formData.append(`property[${key}]`, this.state.property[key]);
    });

    fetch(`/api/properties/${this.state.property.id}/update`, {
      method: 'PUT',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        console.log('Post updated:', data.post);
        window.location.href = '/';
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
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
    console.log('File name:', file.name);
    this.setState({ newImage: file });
    this.previewImage(file);
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

  componentDidMount() {
    fetch(`/api/properties/${this.props.property_id}`)
      .then(handleErrors)
      .then(data => {
        this.setState({
          property: data.property,
          loading: false,
        })
      })
  }

  render() {
    const { property, loading, previewImage } = this.state;
    if (loading) {
      return <Layout>loading...</Layout>; // Added Layout component here
    };
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
      user,
    } = property

    return (

      <Layout>
        <div
          className="property-image mb-3"
          style={{ backgroundImage: `url(${previewImage || image_url})` }}
        />
        <div className="container">
          <div className="row">
            <div className="info col-12 col-lg-7">
              <input
                type="file"
                onChange={this.handleFileChange}
                ref={(input) => (this.fileInput = input)}
                style={{ display: 'none' }}
              />
              <div className="mb-3">
                <h4>Title</h4>
                <input name="title" type="text" className="mb-0" value={title} onChange={this.handleInputChange} />
                <h4>City</h4>
                <input name="city" type="text" className="mb-0" value={city} onChange={this.handleInputChange} />
                <h4>Username</h4>
                <p name="username" className="mb-0" onChange={this.handleInputChange}>{user.username} </p>
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
                <button className="btn btn-large btn-danger btn-block m-3" onClick={this.updateProperty}>Save</button>
                <a className="btn btn-large btn-danger btn-block m-3" href="/">Cancel</a>
              </div>
            </div>
          </div>
        </div>
      </Layout >
    )
  }
}

export default EditProperty