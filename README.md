# RetroClick

A free online vintage photo editor with retro film filters. Transform your photos with beautiful polaroid-style effects.

**Live Demo:** [retroclick.prasen.dev](https://retroclick.prasen.dev/)

## Features

- Upload and edit photos with zoom and pan support
- Apply vintage filters (B&W, Sepia, Vintage, Warm, Cool, Fade, Vivid)
- Customize text with 12+ font options including handwriting styles
- Add titles and dates to your photos
- Download as high-quality PNG with polaroid frame
- Fully responsive - works on desktop and mobile
- No sign-up required, completely free

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Radix UI Components
- TypeScript

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── page.tsx        # Main photo editor component
│   ├── layout.tsx      # Root layout with fonts and metadata
│   └── globals.css     # Global styles
├── components/
│   └── ui/             # Reusable UI components
└── lib/
    └── utils.ts        # Utility functions
```

## Author

Made by [Prasenjit](https://prasen.dev)

## License

MIT

---

*Built with [Blackbox AI](https://www.blackbox.ai/)*
