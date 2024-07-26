# CitrineOS Documentation

Welcome to the repository for the website that holds the documentation of CintrineOS.
This site is built using Jekyll, a static site generator.
If you're looking to make modifications or simply set it up locally, here's what you need to know.

## Prerequisites

- **Ruby**: Jekyll is written in Ruby. Ensure you have Ruby (at least version 2.5) installed by running `ruby -v`. If not, you can [download and install Ruby here](https://www.ruby-lang.org/en/downloads/).
- **Bundler**: Dependencies are managed with bundler. Install Bundler with `gem install bundler`.

## Local Setup

1. **Clone the Repository**: <br/>
   ```shell
    git clone https://github.com/citrineos/citrineos.github.io.git && cd citrineos.github.io
    ```

1. **Install Dependencies**: <br/>
   ```shell
    gem install bundler jekyll && bundle install
    ```

1. **Build and Serve the Website Locally**:<br/>
   ```shell
    jekyll serve
   ```
   This will start a local server, and you can access the site at `http://localhost:4000`.

Alternatively, you can run `docker compose up` which will install the dependencies, build and serve.

## Making Changes

### Adjusting Site Content

- **Navbar**: To add or modify navbar items, adjust the `_data/navigation.yml` file. Each item has a `name` and a `link`, some also have a `logo`. In this case the logo will be displayed and the name is the fallback in case the logo can not be shown. Follow the existing syntax pattern to add more navbar items.

- **Content**: To add content to pages adjust the markdown files, e.g. framework.md. These pages start with Front Matter that starts and ends with `---`. In between these markings a title can be chosen and the default layout is set.
  - **Markdown**:
    Jekyll uses Markdown for content. If you're new to Markdown, here's a [quick guide](https://www.markdownguide.org/getting-started/).

### Customizing Appearance

- **Fonts & Colors**: Adjust global styling variables in the `_sass` directory.
  Under `/utils/_fonts` a new font could be added. The font then also needs to be updated under `/assets/fonts` following the existing pattern.
  Under `/utiles/_variables` chosen colors can be adjusted.
  These changes will be reflected throughout all of the website.

## Deployment

This site uses github actions for deployment. The trigger is set up to deploy everytime changes are pushed to the branch `main`.