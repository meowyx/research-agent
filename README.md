# Research Agent with Gaia

![Research Agent Demo](./deep-research.gif)

A sophisticated AI-powered research assistant built with Next.js and [Gaia](https://docs.gaianet.ai/intro/). This research agent helps you conduct thorough and structured research on any topic by leveraging Gaia's decentralized computing infrastructure.

## About Gaia

[Gaia](https://docs.gaianet.ai/intro/) is a decentralized computing infrastructure that enables everyone to create, deploy, scale, and monetize their own AI agents. This project uses Gaia's AI capabilities to provide an intelligent research agent that can analyze, synthesize, and present information in a structured manner.

## Features

### Core Research Capabilities
- 🤖 Automated research planning and execution
- 📚 Multi-step research process
- 🔍 Intelligent search and analysis
- 🧠 Information synthesis and summarization
- 🔬 Deep research capabilities with "dig deeper" functionality

### User Interface
- 🎨 Modern, responsive design with Tailwind CSS
- 📱 Interactive tabs for different research views
- ✨ Smooth animations and transitions
- 📊 Real-time progress tracking
- ♿ Accessibility features (including reduced motion support)

### Research Workflow
1. **Planning Phase**: Creates a structured research plan
2. **Execution Phase**: Carries out the research steps
3. **Evaluation Phase**: Analyzes and processes findings
4. **Synthesis Phase**: Summarizes research results
5. **Deep Research**: Explores topics further with additional steps

### Research Artifacts
- 🌐 Web page analysis
- 📄 Academic paper processing
- 💻 GitHub repository analysis
- 🔎 Search result processing
- 📝 Summary generation

## Setting Up Your Gaia Node

To use your own Gaia node with this application, follow these steps:

### Option 1: Run Your Own Node

1. **Install GaiaNet Node**:
   ```bash
   curl -sSfL 'https://github.com/GaiaNet-AI/gaianet-node/releases/latest/download/install.sh' | bash
   ```

2. **Initialize with a Model**:
   ```bash
   # For Llama-3-Groq-8B model (recommended for this project)
   gaianet init --config https://raw.githubusercontent.com/GaiaNet-AI/node-configs/main/llama-3-groq-8b-tool/config.json
   ```

3. **Start the Node**:
   ```bash
   gaianet start
   ```

4. **Update Your Application**:
   - Modify the API endpoint to point to your local node:
   ```typescript
   const GAIA_API_ENDPOINT = 'http://gaiaURL/v1';
   const GAIA_MODEL = 'Llama-3-Groq-8B-Tool';
   ```

### Option 2: Get an API Key

1. **Create an Account**:
   - Go to [https://gaianet.ai](https://gaianet.ai) and click on **Launch App**
   - Connect your MetaMask wallet

2. **Generate an API Key**:
   - Click on your profile dropdown and select **Settings**
   - Navigate to **Gaia API Keys** and click **Create API Key**
   - Give your key a name and save it securely

3. **Update Your Application**:
   - Add your API key to the environment variables:
   ```
   GAIA_API_KEY=your_api_key_here
   ```

### System Requirements

If running your own node, ensure your system meets these requirements:

| System | Minimum Requirements |
|--------|---------------------|
| OSX with Apple Silicon (M1-M4 chip) | 16GB RAM (32GB recommended) |
| Ubuntu Linux 20.04 with Nvidia CUDA 12 SDK | 8GB VRAM on GPU |
| Azure/AWS | Nvidia T4 GPU Instance |

## Tech Stack

- Next.js 15.3.1
- TypeScript
- Tailwind CSS
- Framer Motion
- AI SDK Integration

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- pnpm (Package manager)

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd research-agent
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
research-agent/
├── app/              # Next.js app directory
│   ├── api/         # API routes
│   └── page.tsx     # Main page
├── components/      # React components
│   └── ui/         # UI components
├── lib/            # Utility functions and types
└── public/         # Static assets
```

## Usage

1. Enter your research query in the input field
2. The agent will create a research plan
3. Watch as it executes the research steps
4. Review the results in different tabs:
   - Plan: View the research strategy
   - Results: See gathered information
   - Summary: Read the synthesized findings
5. Use "Dig Deeper" to explore topics further

## Development

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license information here]

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Gaia](https://docs.gaianet.ai/intro/)
- Animations powered by [Framer Motion](https://www.framer.com/motion/)
