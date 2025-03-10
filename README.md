# Noteey - Modern Note Manager

Noteey is a modern desktop note-taking application built with Electron and React. It offers a wide range of features to efficiently organize and manage your notes.

## Key Features

- 🎨 Modern interface with light/dark theme
- 📝 Rich text editor with formatting
- 🏷️ Tag system for note organization
- 📎 File attachment support
- 🔍 Advanced search functionality
- 💾 Automatic saving
- 📱 Responsive design

## System Requirements

- Node.js 14.x or higher
- npm 6.x or higher
- Operating System: Windows, macOS, or Linux

## Installation

1. Clone the repository:
```bash
git clone https://github.com/giovannicarlino04/noteey.git
cd noteey
```

2. Install dependencies:
```bash
npm install
```

3. Start the application in development mode:
```bash
npm start
```

## Building for Distribution

To create an executable package:

```bash
npm run build
```

The executable files will be created in the `dist` folder.

## Project Structure

```
noteey/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # Context API
│   ├── services/       # Services (local storage, etc.)
│   ├── styles/         # CSS files
│   ├── utils/          # Utility functions
│   ├── App.js          # Main component
│   └── index.js        # Entry point
├── main.js             # Main Electron process
├── package.json        # Dependencies and scripts
└── webpack.config.js   # Webpack configuration
```

## Technologies Used

- Electron
- React
- Material-UI
- Webpack
- electron-store (for local storage)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Support

If you encounter any issues or have questions, please open an issue in the GitHub repository. 