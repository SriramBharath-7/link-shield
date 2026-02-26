# LinkShield AI 🛡️

Advanced URL threat detection powered by VirusTotal API - Built with Next.js and deployed on Vercel.

![LinkShield AI](https://img.shields.io/badge/Status-Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🚀 Features

- **Real-time URL Scanning**: Integrated with VirusTotal API v3
- **90+ Security Vendors**: Get threat analysis from multiple security engines
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Detailed Reports**: View malicious, suspicious, harmless, and undetected stats
- **Fast & Secure**: Serverless API routes on Vercel

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: VirusTotal API v3
- **Deployment**: Vercel

## 📦 Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Run the development server**:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deployment to Vercel

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Add environment variable:
   - Key: `VIRUSTOTAL_API_KEY`
   - Value: Your VirusTotal API key
6. Click "Deploy"

## 🎯 Usage

1. Enter any URL in the input field
2. Click "🔍 Scan URL"
3. Wait 2-5 seconds for analysis
4. View detailed security report

---

**Built with ❤️ using Next.js and VirusTotal API**
