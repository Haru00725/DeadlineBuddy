# DeadlineBuddy

**Your deadlines, under control.**

DeadlineBuddy is a student productivity app that helps college students manage assignments, exams, and projects. Upload a college notice and let AI extract your deadlines automatically.

## Features

- **AI Notice Scanning**: Upload PDFs, images, or paste text to automatically extract tasks and deadlines using AI
- **Task Management**: Create, edit, complete, and delete tasks with full CRUD functionality
- **Calendar View**: Weekly calendar showing all your deadlines at a glance
- **Local Storage**: All tasks persist in your browser - no account needed
- **Export Options**: Export tasks as JSON for backup or ICS for calendar apps
- **PWA Support**: Install as an app on Android and iOS
- **Mobile-First**: Designed for phones with responsive desktop support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Haru00725/DeadlineBuddy.git
cd DeadlineBuddy

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your AI API key to .env.local
# GEMINI_API_KEY=your_key_here

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | For AI scanning | AI API key for document and notice scanning |
| `GEMINI_MODEL` | No | Model to use (default: `gemini-flash-lite-latest`) |

**Note**: The app works without an API key for manual task management. Only the AI scanning feature requires the API key.

## Usage

### Manual Task Creation

1. Click the **+ New Task** button
2. Fill in task details (title, subject, due date, etc.)
3. Click **Create Task**

### AI Notice Scanning

1. Navigate to **Scan Notice**
2. Upload a PDF, image, or paste notice text
3. Review the extracted tasks
4. Edit any incorrect information
5. Select tasks to add and click **Add Selected Tasks**

**Important**: Uploaded documents are processed securely by AI. No documents are stored after processing.

### Exporting Tasks

- **JSON Export**: Go to Settings > Export Tasks (JSON) for backup/import
- **ICS Export**: Go to Settings > Export to Calendar (ICS) for calendar apps

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI**: Intelligent Document Vision & Extraction
- **Storage**: Browser localStorage
- **Icons**: Lucide React

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add `GEMINI_API_KEY` to environment variables
4. Deploy

### Self-Hosted

```bash
npm run build
npm start
```

## Privacy

- All tasks are stored locally in your browser
- Tasks are never sent to our servers
- Uploaded documents for scanning are processed securely by AI
- Documents are not stored after AI processing

## License

MIT
