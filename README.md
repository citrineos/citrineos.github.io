# CitrineOS Documentation

Welcome to the repository for the website that holds the documentation of CintrineOS.
This site is built using [MkDocs](https://www.mkdocs.org, a static site generator for displaying markdown documentation.
If you're looking to make modifications or simply set it up locally, here's what you need to know.

## Prerequisites

- **Python**: 3.13+ is required [https://www.python.org/](https://www.python.org/)
- **Poetry**: Used for consistent dependency management [https://python-poetry.org/](https://python-poetry.org/)

## Local Setup

1. **Clone the Repository**: <br/>
   ```shell
    git clone https://github.com/citrineos/citrineos.github.io.git && cd citrineos.github.io
    ```

1. **Install Dependencies**: <br/>
   ```shell
    poetry install
    ```

1. **Serve the Website Locally**:<br/>
   ```shell
    poetry run mkdocs serve   
   ```
   This will start a local server, and you can access the site at `http://localhost:8000`.

[//]: # ( Maybe add docker compose setup Alternatively, you can run `docker compose up` which will install the dependencies, build and serve.)

## Making Changes

### Markdown

[Mkdocs](https://www.mkdocs.org) uses Markdown for content. 
If you're new to Markdown, here's a [quick guide](https://www.markdownguide.org/getting-started/).

### Adjusting Site Content

If you want to add a new page, you can create a new markdown file in the `/docs` directory.
To make the page visible in the navigation, add it in the `mkdocs.yml` file under the `nav` section.
Take a look at the other markdown files for examples.
Ideally add some frontmatter for at least the title to stay consistant.


### Customizing Appearance

We use the [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) theme.
In the file `docs/assets/stylesheets/extra.css` you can find all the customizations and add to them.
This file basically overrides the default styling.


## Deployment

This site uses Github actions to publish the newest version.
Simply merge to the main branch and the CI pipeline will do the rest. 
We followed these docs to run the pipeline: https://squidfunk.github.io/mkdocs-material/publishing-your-site/
When the pipeline is done, you should see the new version at https://citrineos.github.io

### Versioning (Not yet implemented for pipeline yet)

As our project runs through different versions, we want to also keep the documentation versioned accordingly.
For this we use `mike` that tracks the documentation associated with different versions.
You don't have to take care of this too much when adjusting documentation.
The deployment process should take care of this automatically.