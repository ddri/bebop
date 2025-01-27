# Contributing to Bebop

Thanks for your interest in contributing to Bebop! This document provides guidelines and important security considerations for contributors.

## Getting Started

1. Fork the repository
2. Create a local copy: `git clone https://github.com/yourusername/bebop.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Copy `.env.example` and rename it to `.env` and add your own values
5. Install dependencies: `npm install`
6. Start the development server: `npm run dev`
7. Open the application by going to `http://localhost:3000` in your local browser

## Security Guidelines

### 🚫 Never commit:
- API keys or tokens
- Database credentials
- Private environment variables
- Personal Hashnode credentials
- Production URLs or IDs

### ✅ Do:
- Use `.env` for your actual environment variables
- Add `.env` to your `.gitignore` file so git ignores them when commiting to a brand
- Use `.env.example` for showing environment variable structure
- Remove any console.log statements before committing
- Use placeholder values for examples
- Be careful when sharing screenshots (blur sensitive data)

## Development Process

1. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

2. **Testing**
   - Test your changes locally
   - Ensure existing features still work

3. **Committing**
   - Write clear commit messages
   - Keep commits focused and atomic
   - Double-check for sensitive data

4. **Create a Pull Request**
   - Provide a clear description
   - Reference any related issues
   - Include screenshots if UI changes
   - List any new dependencies

## Best Practices

- Use TypeScript for type safety
- Follow existing component patterns
- Use shadcn/ui components exclusively where possible
- Keep components modular and reusable
- Add proper error handling

## File Organization

```
src/
app/             # Next.js app router pages
components/      # Reusable React components
hooks/          # Custom React hooks
lib/            # Utility functions and configuration
styles/         # Global styles
```

## Questions?

- Open an issue for feature discussions
- Use pull requests for code changes
- Tag security-related issues appropriately

## License

By contributing, you agree that your contributions will be licensed under the project's license.
