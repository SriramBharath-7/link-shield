# 🛡️ LinkShield AI

<div align="center">

**Scan Before You Click - Advanced URL Threat Detection**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![VirusTotal](https://img.shields.io/badge/VirusTotal-API%20v3-394EFF?style=for-the-badge&logo=virustotal)](https://www.virustotal.com/)
[![Deployed](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

[Live Demo](https://link-shield.vercel.app) • [Report Bug](https://github.com/SriramBharath-7/link-shield/issues) • [Request Feature](https://github.com/SriramBharath-7/link-shield/issues)

</div>

---

## ✨ What is LinkShield AI?

**LinkShield AI** is a next-generation URL security scanner that protects you from phishing, malware, and malicious websites. Powered by **70+ security engines** through the VirusTotal API, it provides instant, comprehensive threat analysis before you click any suspicious link.

### Why LinkShield?
- 🚨 **Real-time Threat Detection** - Instant scanning using VirusTotal's massive threat intelligence database
- 🔒 **Privacy First** - API keys secured server-side, no client exposure
- ⚡ **Lightning Fast** - Serverless architecture for sub-second response times
- 🎨 **Cybersecurity Aesthetic** - Interactive circuit board UI with cursor-responsive grid effects
- 📊 **Detailed Analysis** - Comprehensive reports from 70+ security vendors

---

## 🎯 Key Features

### Security & Detection

<table>
<tr>
<td width="50%">

**🔍 Multi-Engine Scanning**
- Analyzes URLs against 70+ security engines
- Real-time threat intelligence
- Phishing, malware, and scam detection

**📈 Comprehensive Reports**
- Malicious verdict counts
- Suspicious flag tracking
- Detailed engine-by-engine results
- Domain reputation analysis

</td>
<td width="50%">

**🛡️ Safety Recommendations**
- AI-powered safety tips
- Threat-specific warnings
- Best practices guidance
- Risk level assessment

**⚙️ Advanced Details**
- SSL certificate validation
- Domain registration info
- Historical scan data
- Server location tracking

</td>
</tr>
</table>

### User Experience

- **Interactive Grid Effect** - Cursor-reactive circuit board pattern that reveals on hover
- **Pitch Black Theme** - Premium cybersecurity aesthetic with circuit traces
- **Glassmorphism UI** - Modern blur effects with neon blue/cyan accents
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Smooth Animations** - Polished transitions and loading states
- **Real-time Feedback** - Progress indicators and scan status updates

---

## 🏗️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript 5 |
| **Styling** | Custom CSS, Glassmorphism, CSS Grid Patterns |
| **API Integration** | VirusTotal API v3, REST endpoints |
| **Backend** | Next.js API Routes (Serverless) |
| **Security** | Server-side API key management, Input sanitization |
| **Deployment** | Vercel (Edge Functions) |
| **Version Control** | Git, GitHub |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- VirusTotal API Key ([Get one here](https://www.virustotal.com/gui/join-us))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/SriramBharath-7/link-shield.git
cd link-shield
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Create .env.local file in the root directory
VIRUSTOTAL_API_KEY=your_api_key_here
```

4. **Run development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:3000
```

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import to Vercel:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Select your GitHub repository
   - Configure environment variable:
     ```
     VIRUSTOTAL_API_KEY = your_virustotal_api_key
     ```
   - Click "Deploy"

3. Your app will be live in ~60 seconds!

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VIRUSTOTAL_API_KEY` | Your VirusTotal API v3 key | Yes |

---

## 📖 Usage

### Scanning a URL

1. **Paste the suspicious URL** into the input field
2. **Click "🔍 Scan URL"** to initiate analysis
3. **Wait 2-5 seconds** for VirusTotal to complete scanning
4. **Review the detailed report** showing:
   - Overall safety verdict
   - Malicious/suspicious/harmless counts
   - Individual engine results
   - Safety recommendations
   - Domain information

### Understanding Results

- **🔴 Malicious**: URL flagged as dangerous by multiple engines
- **🟡 Suspicious**: Some engines flagged potential threats
- **🟢 Clean**: No threats detected by any engine
- **⚪ Undetected**: Insufficient data for verdict

---

## 🎨 Design Features

### Interactive Circuit Board
- **Pitch Black Background** - Professional cybersecurity aesthetic
- **Dynamic Grid Pattern** - 5×3 circuit trace layout with center cross
- **Cursor-Responsive Grid** - Fine 40×40px grid reveals on hover
- **Connection Nodes** - 15 intersection points lighting up the circuit
- **Smooth Animations** - Subtle transitions and reveal effects

### Color Palette
- Electric Blue: `#0066ff`
- Cyan Glow: `#00d4ff`
- Magenta Accent: `#ff0066`
- Circuit Dim: `rgba(0, 102, 255, 0.15)`
- Circuit Active: `rgba(0, 212, 255, 0.6)`

---

## 🏆 Use Cases

- **Personal Safety** - Check suspicious emails, texts, or social media links
- **Business Security** - Verify vendor/partner URLs before clicking
- **Education** - Teach cybersecurity awareness and phishing detection
- **IT Teams** - Quick threat analysis for reported suspicious links
- **Developers** - API demonstration and security tool integration

---

## 📊 API Information

### VirusTotal API Limits

| Tier | Requests | Rate Limit |
|------|----------|------------|
| **Free** | 500/day | 4 requests/minute |
| **Premium** | Unlimited | Higher rate limits |

### API Features Used
- `/urls` endpoint for URL submission
- `/analyses/{id}` for result retrieval
- JSON response parsing
- Multi-engine aggregation

---

## 🔒 Security

- ✅ **API Keys Server-Side Only** - Never exposed to client
- ✅ **Input Validation** - Sanitized and validated on backend
- ✅ **Error Handling** - Graceful degradation without data leakage
- ✅ **HTTPS Only** - Secure transport layer
- ✅ **No Data Storage** - Privacy-focused, no URL logging

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [VirusTotal](https://www.virustotal.com/) - Threat intelligence platform
- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting and deployment
- Inspired by modern cybersecurity dashboards and threat detection tools

---

## 📧 Contact

**Sriram Bharath** - [@SriramBharath-7](https://github.com/SriramBharath-7)

Project Link: [https://github.com/SriramBharath-7/link-shield](https://github.com/SriramBharath-7/link-shield)

Live Demo: [https://link-shield.vercel.app](https://link-shield.vercel.app)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Built with 🛡️ for a safer internet

</div>

