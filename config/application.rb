require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module AirbnbClone
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 6.1

    config.active_storage.service = :amazon

    config.x.env_vars = {
      stripe_publishable_key: ENV['STRIPE_PUBLISHABLE_KEY'],
      stripe_secret_key: ENV['STRIPE_SECRET_KEY'],
      stripe_mark_complete_webhook_signing_secret: ENV['STRIPE_MARK_COMPLETE_WEBHOOK_SIGNING_SECRET'],
      stripe_token: ENV['STRIPE_TOKEN'],
      aws_access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      aws_secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
      url: ENV['URL']
    }
    
    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")
  end
end
