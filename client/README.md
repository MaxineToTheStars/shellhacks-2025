# MindPath - React Client

A modern React TypeScript application for personal wellness journey management with a beautiful, nature-inspired TailwindCSS interface.

## Features

- ✅ Create new journal entries
- ✅ View your wellness journey
- ✅ Edit and refine your thoughts
- ✅ Remove outdated entries
- ✅ Real-time updates
- ✅ Responsive design
- ✅ TypeScript for type safety
- ✅ MindPath brand design system
- ✅ Nature-inspired color palette
- ✅ Encouraging, empathetic messaging

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **TailwindCSS** - Styling with MindPath design system
- **Webpack 5** - Bundling
- **PostCSS** - CSS processing
- **Google Fonts** - Merriweather (serif) & Montserrat (sans-serif)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- The Notes API server running on `http://localhost:3000`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure the API server is running:
```bash
# In the server directory
cd ../server
npm run dev
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Building for Production

Build the production bundle:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## API Integration

This client connects to the Notes API with the following endpoints:

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a single note
- `PUT /api/notes/:id` - Update a note (full update)
- `PATCH /api/notes/:id` - Partial update of a note
- `DELETE /api/notes/:id` - Delete a note

## Project Structure

```
src/
├── components/          # React components
│   ├── Note.tsx        # Individual note component
│   └── NoteForm.tsx    # Form for creating notes
├── services/           # API services
│   └── api.ts         # API client
├── types/             # TypeScript type definitions
│   └── index.ts       # Note and API types
├── App.tsx            # Main application component
├── index.tsx          # Application entry point
└── index.css          # Global styles with TailwindCSS
```

## Usage

1. **Chart Your Next Step**: Fill in the entry title and your thoughts, then click "Add to Your Journey"
2. **View Your Journey**: All entries are displayed in a timeline with the most recent first
3. **Refine Your Path**: Click the "Refine" button on any entry to modify it
4. **Remove an Entry**: Click the "Remove" button and confirm to remove an entry
5. **Refresh Path**: Use the "Refresh Path" button to reload all entries from the server

## Error Handling

The app includes comprehensive error handling:
- Network errors are displayed to the user
- Form validation prevents invalid submissions
- Loading states provide user feedback
- Confirmation dialogs prevent accidental deletions
