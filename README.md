# AI Todo List Application

A modern todo list application with AI-powered suggestions, project management, and calendar integration.

## Features

- AI-powered task suggestions
- Project management with multiple lists
- Calendar integration for date-based tasks
- Status tracking (Not started, In progress, Done)
- Premium features with Stripe integration
- Modern UI with Tailwind CSS and ShadcnUI
- Authentication with Clerk

## Prerequisites

- Node.js 16.x or later
- npm or yarn
- Clerk account for authentication
- Stripe account for payments
- OpenAI API key for AI suggestions

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-todo-list.git
cd ai-todo-list
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

## Project Structure

```
src/
  ├── components/     # React components
  ├── contexts/      # React context providers
  ├── hooks/         # Custom React hooks
  ├── lib/           # Utility functions and configurations
  ├── App.js         # Main application component
  ├── index.js       # Application entry point
  └── index.css      # Global styles
```

## Features

### Todo List
- Create, update, and delete tasks
- Track task status (Not started, In progress, Done)
- AI-powered task suggestions
- Free tier limit (3 lists)

### Calendar
- Date-based task management
- Visual calendar interface
- Task completion tracking

### Projects
- Create multiple project lists
- Organize tasks by project
- Track project progress

### Settings
- Account management
- Subscription management
- User preferences

## Premium Features

- Unlimited lists and projects
- Advanced AI suggestions
- Priority support
- Custom themes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

