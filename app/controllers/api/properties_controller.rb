module Api
  class PropertiesController < ApplicationController
    before_action :set_property, only: [:show, :update]

    def create
      property = Property.new(property_params)
      property.user_id = current_user.id

      if property.save
        handle_image_upload(property)
        render json: property, status: :created
      else
        render json: property.errors, status: :unprocessable_entity
      end
    end

    def index
      @properties = Property.order(created_at: :desc).page(params[:page]).per(6)
      render json: { properties: serialized_properties, total_pages: @properties.total_pages, current_page: @properties.current_page }, status: :ok
    end    

    def show
      render 'api/properties/show', status: :ok
    end

    def update
      if @property.update(property_params)
        handle_image_upload(@property)
        render json: @property, status: :ok
      else
        render json: @property.errors, status: :unprocessable_entity
      end
    end

    def edit_property
      render 'edit_property'
    end

    private

    def set_property
      @property = Property.find_by(id: params[:id])
      render json: { error: 'not_found' }, status: :not_found unless @property
    end

    def serialized_properties
      @properties.map do |property|
        property_attributes = property.attributes
        property_attributes["image_url"] = property.image_url
        property_attributes
      end
    end

    def handle_image_upload(property)
      return unless params[:property][:image].present?

      image = params[:property][:image]
      original_filename = image.respond_to?(:original_filename) ? image.original_filename : File.basename(image.path)
      image_url = upload_to_aws(image, original_filename)
      return unless image_url

      property.image.purge if property.image.attached?
      property.image.attach(io: URI.open(image_url), filename: File.basename(URI.parse(image_url).path), content_type: image.content_type)

      property.update(image_url: image_url)
    end

    def upload_to_aws(file, filename)
      s3 = Aws::S3::Resource.new(
        region: 'us-east-1',
        access_key_id: ENV['AWS_ACCESS_KEY_ID'],
        secret_access_key: ENV['AWS_SECRET_ACCESS_KEY']
      )

      object = s3.bucket('airbnb-yonasoft').object("properties/#{SecureRandom.uuid}/#{filename}")

      begin
        object.upload_file(file.tempfile.path, acl: 'public-read')
        object.public_url.to_s
      rescue => e
        puts "Error uploading image to S3: #{e.message}"
        nil
      end
    end

    def property_params
      params.require(:property).permit(:title, :description, :city, :country, :property_type, :price_per_night, :max_guests, :bedrooms, :beds, :baths, :image, :id, :image_url)
    end    
  end
end
