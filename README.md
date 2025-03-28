# Ceminay - Gemini AI Chat Application

A modern chat application built with React that leverages Google's Gemini AI for conversations and image analysis.

## Features

- **Text Chat**: Have conversations with Gemini AI
- **Vision Chat**: Upload images for analysis and ask questions about them
- **Dark/Light Mode**: Toggleable theme with system preference detection
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Serverless Backend**: Uses Netlify Functions to interact with the Gemini API

## Tech Stack

- React.js (18+)
- CSS with custom properties for theming
- Google Generative AI SDK
- FontAwesome for icons
- Netlify for hosting and serverless functions

## Getting Started

### Prerequisites

- Node.js 14+ and npm
- A Google AI Studio API key for Gemini (from https://aistudio.google.com/)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/ceminay-gemini-chat.git
cd ceminay-gemini-chat
```

2. Install dependencies
```
npm install
cd netlify/functions && npm install && cd ../..
```

3. Set up environment variables
Create a `.env` file in the root directory and add your API key:
```
GEMINI_API_KEY=your_api_key_here
```

### Development

To run the app locally:
```
npm start
```

To run the Netlify Functions locally:
```
npm install -g netlify-cli
netlify dev
```

## Deployment

This project is configured for deployment on Netlify:

1. Push your code to a GitHub repository

2. Log in to Netlify, create a new site from Git, and link your repository

3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`

4. Add your environment variables in the Netlify UI:
   - GEMINI_API_KEY: your_api_key_here

5. Deploy!

## Usage

- **Text Chat**: Select the "Chat" tab and start typing
- **Vision Chat**: 
  - Select the "Vision" tab
  - Upload an image by dragging and dropping or clicking the upload area
  - Ask questions about the image

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google for the Gemini AI API
- The React team
- Netlify for serverless hosting 