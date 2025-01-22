# bebop

Bebop is an opinionated content publishing tool for technical content creators. It is built around the workflow familiar to roles such as Developer Relations, where managing content to publish and cross-post across multiple publishing destinations often involved a range of writing tools, copying and pasting, and spreadsheets to track it all. 

Bebop is being built to enhance the writing workflow by:

- **Eliminating content silos:** Bring all your writing together in one place.
- **Saving time and effort:** Automate repetitive tasks and streamline the publishing process.
- **Ensuring consistency:** Maintain a single source of truth for your content and easily update it across all platforms.

Bebop has a suite of features in development that are inspired by prior products I've built either for large software companies (e.g. Red Hat's PressGang CCMS) or for commercial projects (the SaaS company Corilla) and have been annoying to live without. These allow the user to write in whatever writing tool they prefer, sync the files to Bebop, and then be able to:

- **Combine content dynamically with Collections:** Merge multiple notes into a single output, like a team document or blog post, with the ability to regenerate and update all downstream copies with one click.
- **Streamline cross-posting:** Publish your content to various platforms without the hassle of manual copying and pasting.
- **Automate reporting:** Understand what content and communications are most effective in a devrel campaign, or to review product launches, etc.


## Stack

The current version of Bebop is a local application built on NextJS and Typescript, using the shadcn component library, and CodeMirror as basic text editor. The next milestone release is a webapp using MongoDB Atlas for document storage, and a host of publishing services integrated directly into the UI. 


## Upcoming features and roadmap

See the GitHub Issues for upcoming features and Milestone releases. 
