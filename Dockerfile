# Use the official Ruby image with Ruby 3.3.0
FROM ruby:3.2.0

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the rest of the application code into the container
COPY . .

# Install Bundler and Jekyll
RUN gem install bundler jekyll

# Install dependencies
RUN bundle install

# Expose the port Jekyll will serve on
EXPOSE 4000

# Run Jekyll serve command
CMD ["jekyll serve", "--host=0.0.0.0"]
