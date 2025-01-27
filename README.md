# bebop

Bebop is an opinionated content publishing tool for technical content creators. It is built around the workflow familiar to roles such as Developer Relations, where managing content to publish and cross-post across multiple publishing destinations often involved a range of writing tools, copying and pasting, and spreadsheets to track it all. 

Bebop is being built to enhance the writing workflow by:

- **Eliminating content silos:** Bring all your writing together in one place.
- **Saving time and effort:** Automate repetitive tasks and streamline the publishing process.
- **Ensuring consistency:** Maintain a single source of truth for your content and easily update it across all platforms.

Bebop has a suite of features in development that are inspired by prior products I've built either for large software companies (e.g. Red Hat's PressGang CCMS) or for commercial projects (my previous SaaS company Corilla) and have been annoying to live without. These are the kinds of features that allow the user to write in whatever writing tool they prefer, sync the files to Bebop, and then be able to:

- **Combine content dynamically with Collections:** Merge multiple notes into a single output, like a team document or blog post, with the ability to regenerate and update all downstream copies with one click.
- **Streamline cross-posting:** Publish your content to various platforms without the hassle of manual copying and pasting.
- **Automate reporting:** Understand what content and communications are most effective in a devrel campaign, or to review product launches, etc.

## Contributions and requests

Bebop is a personal project I am developing on nights and weekends. My day job is as a product manager and developer for a quantum computing company, so please be patient with any feedback, feature requests, bugs, or pull requests. I appreciate your time and attention and will do my best to accomdoate where possible.

## Stack

The current version of Bebop is a local application built on NextJS and Typescript, using the shadcn component library, and CodeMirror as basic text editor. The next milestone release is a webapp using MongoDB Atlas for document storage, and a host of publishing services integrated directly into the UI. 


## Upcoming features and roadmap

See the GitHub Issues for upcoming features and Milestone releases. 

## Screenshots

The Topcis page is a collection of topics, which is the name given to the document files covering a specific topic. 

<img width="1395" alt="image" src="https://github.com/user-attachments/assets/585f1225-a876-4dfb-b99f-6cb96133d969" />


The Collections page is where we create collections, which are a logical container for topics. Whatever documents we include in here, are combined together and published as a document, blog post, whatever the end point publishes to.

<img width="1396" alt="image" src="https://github.com/user-attachments/assets/66ed4260-61e5-48dc-a061-fa051fc17537" />

Collections allow you to pick what Topics are included, order and reorder them, and then publish to the Bebop hosted blog posts, or your choice of a range of popular blogging sites (such as Hashnode and Medium).

<img width="1386" alt="image" src="https://github.com/user-attachments/assets/25701431-cf06-4065-bbb6-28e10a2bfea2" />


