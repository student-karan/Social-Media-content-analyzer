# Social Media Content Analyzer

A full-stack application that leverages OCR and AI to analyze social media content from images and PDF documents. It provides an engagement score, tone analysis, platform fit, and actionable suggestions to improve content performance.

## 🚀 Features

- **Multi-format Support:** Upload images (JPG, PNG) or PDF documents.
- **OCR Integration:** Extracts text from files using Tesseract.js.
- **AI-Powered Insights:** Uses Google Gemini AI to analyze extracted content.
- **Real-time Feedback:** Interactive UI with drag-and-drop support and toast notifications.
- **Detailed Reporting:** Get engagement scores, tone identification, trending tags, and improvement suggestions.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State/API:** Axios & React Hooks
- **Notifications:** React Hot Toast
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **OCR:** Tesseract.js
- **PDF Processing:** `pdf-to-png-converter`
- **AI:** Google Gemini API
- **File Handling:** Multer
- **Deployment:** Render

## 📂 Project Structure

```text
.
├── BackEnd/              # Express server with OCR and AI logic
│   ├── src/
│   │   ├── controllers/  # Request handlers (Analysis logic)
│   │   ├── lib/          # Gemini AI integration and types
│   │   ├── middleware/   # Multer configuration
│   │   └── index.ts      # Server entry point
├── FrontEnd/             # React application
│   ├── src/
│   │   ├── actions/      # API service calls
│   │   ├── lib/          # Axios config and types
│   │   └── App.tsx       # Main UI component
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- Google Gemini API Key

### Backend Setup
1. Navigate to `BackEnd` directory.
2. Create a `.env` file:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_api_key_here
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to `FrontEnd` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

## 🧠 Approach

1. **File Ingestion:** The user uploads an image or PDF via the React interface.
2. **Text Extraction:** 
   - For images, **Tesseract.js** performs direct OCR.
   - For PDFs, the backend first converts pages to images using **pdf-to-png-converter**, then performs OCR on each page.
3. **AI Analysis:** The extracted text is bundled with metadata and sent to the **Gemini AI** model. The prompt instructs the AI to return a structured JSON response containing:
   - Engagement Score (0-100)
   - Content Tone
   - Suggested Platforms
   - Relevant Hashtags
   - Optimization Suggestions
4. **Data Visualization:** The frontend parses the JSON response and renders an aesthetic report card for the user.

## 📝 License
MIT
