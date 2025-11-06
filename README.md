

-----

# Sypha Prompt Chat

A simple, local-first chat interface designed for experimenting with prompt templates against open-source models running on Ollama.

*(Recommendation: Upload your screenshot `image_d058d4.png` to a site like Imgur and paste the URL here)*

## 🚀 Key Features

  * **Local-First:** Connects directly to your local Ollama instance running on `localhost:11434`.
  * **Model Selection:** Easily switch between any of your installed Ollama models.
  * **Dynamic Prompt Templating:** Pre-format your prompts using `Freeform`, `JSON`, `XML`, `Markdown`, or `YAML` templates.
  * **Task-Based Input:** Input a simple task (e.g., "what's 4+3") and generate a structured template from it.
  * **Prompt Editor:** Full control to edit the final, structured prompt before sending it to the model.
  * **Streaming Responses:** The assistant's response is streamed back in real-time.
  * **Dynamic Assistant Naming:** The chat window shows which model is responding (e.g., `Llama3:`, `Gemma:`, etc.).

## 🛠️ Tech Stack

  * **Frontend:** React, TypeScript, Tailwind CSS
  * **Backend:** Node.js, Express (used as a proxy for Ollama)
  * **AI:** Ollama

## 🏁 Getting Started

Follow these instructions to get the project running on your local machine.

### 1\. Prerequisites

Before you begin, ensure you have the following installed:

  * **Node.js:** (v18.0.0 or higher)
  * **Ollama:** You must have the [Ollama desktop application](https://ollama.com/) installed and **running**.

### 2\. Clone the Repository

Clone your repository to your local machine:

```bash
git clone https://github.com/aayaman1211/OpenSourceChatUI.git
cd OpenSourceChatUI
```

### 3\. Install Dependencies

This project uses a single `package.json` for both the server and the client.

```bash
npm install
```

### 4\. Install Ollama Models

This application is configured to use the models you have installed. Based on your list, run the following commands in your terminal if you haven't already:

```bash
ollama pull llama3:latest
ollama pull mistral:latest
ollama pull phi3:latest
ollama pull gemma:2b
ollama pull codellama:7b
```

### 5\. Run the Application

You will need to open **two (2) separate terminals** in the project folder.

#### Terminal 1: Run the Backend Server

The backend server is a simple Express proxy that handles communication with Ollama.

```bash
node server.js
```

You should see a message: `🚀 Server running on http://localhost:3001`

#### Terminal 2: Run the Frontend App

This command starts the React development server.

```bash
npm run dev
```

Your browser should automatically open to `http://localhost:5173` (or a similar port). If not, open that URL manually.

## 🕹️ How to Use

1.  Ensure your **Ollama application is running**.
2.  Ensure both your **backend server** (Terminal 1) and **frontend app** (Terminal 2) are running.
3.  Open the application in your browser (`http://localhost:5173`).
4.  **Select a Prompt Type** (e.g., "XML").
5.  **Select a Model** (e.g., "Ollama:llama3:latest").
6.  **Enter your task** in the "Task / Prompt" box (e.g., "My name is Aaryaman, what is yours?").
7.  Click **Generate Template**.
8.  The **Prompt Editor** below will be populated with the formatted prompt. You can edit this directly.
9.  Click **Send**.