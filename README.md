# bebop

Bebop is a personal project that is exploring content management methods for writers. I'm building it to support how I create and cross-post content across multiple publishing outputs. It's also a way to collection and combine existing content into one output.

An example of this is creating multiple research notes, and wanting to combine these together and publishing them to a private post for a single point of reference. One example where I've found this useful is having a document for a team discussion or a team member onboarding guide, where I can easily combine existing documents into a single canonical file for them... without copy and paste, and always being able to regenerate the combined file with one click, so all updates are always carried downstream. 

## Stack

The current version of Bebop is a local application using NextJS and Typescript, using the shadcn component library, and CodeMirror as basic text editor. 


## Upcoming features and roadmap

- Publishing to Medium/Hashnode API
- Improved storage/hosting
- Media file management
- Web-application build




## Layout

```
src/
  app/
    page.tsx                    (main page - Topics)
    collections/
      page.tsx                  (Collections route)
    globals.css
    layout.tsx
  components/
    ui/                         (shadcn components)
      button.tsx
      card.tsx
      input.tsx
      separator.tsx
      textarea.tsx
    Collections.tsx             (Collections component)
    MarkdownCMS.tsx            (Topics component)
  providers/
    ThemeProvider.tsx
  lib/
    utils.ts
```    