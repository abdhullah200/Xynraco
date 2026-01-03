<div align="center">

# 🚀 Xynraco Editor

**A modern, web-based IDE built for the next generation of developers.**  
Built with **Next.js**, powered by **WebContainers**, and enhanced by **AI-assisted coding** through **Ollama** — all running *directly in your browser*.

---

<img width="200" height="200" alt="ChatGPT Image Nov 2, 2025, 03_47_51 PM" src="https://github.com/user-attachments/assets/4e7791f7-8971-4add-baa0-8975ffae0ea3" />


</div>

## ✨ Features

| Feature | Status | Description |
|----------|--------|--------------|
| ⚡ **Real-time Execution** | 🚧 In Progress | Run code directly in your browser with WebContainers — no setup required. |
| 🧠 **AI Assistance** | 🚧 Planned | Get intelligent code completions and explanations via Ollama. |
| 🧩 **Multi-Stack Templates** | ✅ Implemented | 30+ starter templates for frontend, backend, and fullstack projects. |
| 💻 **Integrated Terminal** | 🚧 In Progress | Fully functional xterm terminal integration. |
| 🎨 **Developer-First UI** | ✅ Implemented | Modern, responsive interface optimized for productivity. |
| 🔐 **Authentication** | ✅ Implemented | Secure authentication with NextAuth.js and Prisma adapter. |
| 📊 **Dashboard** | ✅ Implemented | User dashboard with project management. |

---

## 🧱 Development Progress

> **Current Phase:** `12 / 14`  
> 🚧 *Actively in development — Early Access Coming Soon!*

### What's Completed ✅
- Core UI components & design system (shadcn/ui)
- Dashboard and authentication system
- Home page and navigation
- Playground editor foundation
- 30+ project templates (Angular, React, Vue, Next.js, etc.)

### What's Coming 🚀
- Editor + WebContainer runtime integration
- AI code assistance (Ollama integration)
- Advanced terminal features
- Project persistence & cloud sync
- Performance optimizations

---

## 🖼️ UI Previews

<div align="center">

### 🏠 Home Page
<img width="1355" height="596" alt="Home Page" src="https://github.com/user-attachments/assets/bf851acf-0918-44b2-ab53-b741a6464009" />

### 📊 Dashboard
<img width="1341" height="603" alt="Dashboard" src="https://github.com/user-attachments/assets/92fef304-d60a-42d7-987f-cbaf222dd416" />

### 🎮 Playground Editor
Feature-rich code editor with Monaco, file system, and integrated terminal.

</div>

---

## 🏗️ Project Structure

```
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication routes
│   ├── (root)/                   # Main application layout
│   ├── api/                      # API routes
│   ├── dashboard/                # Dashboard pages
│   └── playground/               # Playground editor
├── components/
│   ├── modal/                    # Modal components
│   ├── providers/                # Context providers (Session, Theme)
│   └── ui/                       # shadcn/ui component library
├── features/                     # Feature modules
│   ├── ai/                       # AI integration
│   ├── auth/                     # Authentication logic
│   ├── dashboard/                # Dashboard features
│   ├── home/                     # Home page features
│   ├── playground/               # Editor playground features
│   └── WebContainers/            # WebContainer runtime
├── hooks/                        # Custom React hooks
├── lib/                          # Utility functions & database
├── prisma/                       # Database schema & migrations
└── public/vibracode-starters/    # 30+ project templates
```

---

## ⚙️ Tech Stack

### Frontend & Framework
- **Next.js 15** - Full-stack React framework with Turbopack
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling

### Editor & Runtime
- **Monaco Editor** - Powerful code editor
- **WebContainers** - Browser-based Node.js runtime
- **xterm.js** - Terminal emulation

### Backend & Database
- **Prisma 6** - Database ORM
- **MongoDB** - NoSQL database
- **NextAuth.js 5** - Authentication & session management

### UI & Components
- **shadcn/ui** - Headless UI components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Embla Carousel** - Carousel component

### State Management & Forms
- **Zustand** - Lightweight state management
- **React Hook Form** - Efficient form handling
- **Zod** - TypeScript-first schema validation

### Additional Libraries
- **Three.js** & **React Three Fiber** - 3D graphics support
- **Recharts** - Data visualization
- **date-fns** - Date utilities
- **Vaul** - Sheet/drawer component

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB instance running locally or cloud
- (Optional) Ollama for local AI integration

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/xynraco.git
   cd xynraco
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   DATABASE_URL=mongodb://localhost:27017/xynraco
   OLLAMA_API_URL=http://localhost:11434
   ```

4. **Set up Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint checks

---

## 🌍 Vision

> To redefine the way developers build, test, and iterate — all from within the browser.

The **Xynraco Editor** isn't just an IDE. It's a complete developer workspace that's:
- **Local** - Everything runs on your machine with no external dependencies
- **Intelligent** - AI-powered code assistance right where you need it
- **Fast** - Optimized performance with modern tooling
- **Open** - Extensible with a plugin system

---

## 🧭 Roadmap

- [x] **Phase 1–2** – Project Setup & Core UI  
- [x] **Phase 3–4** – Editor & WebContainer Integration (Current)  
- [x] **Phase 5–6** – AI Integration & Terminal Refinement  
- [ ] **Phase 7–8** – Templates, Persistence & Plugin System  
- [ ] **Phase 9–14** – Cloud Sync, Collaboration & UX Polish  

---

## 📦 Key Features in Detail

### Authentication
- Secure NextAuth.js integration
- Prisma database adapter
- Session management
- OAuth ready

### Dashboard
- Project management interface
- User profile management
- Activity tracking

### Playground Editor
- Full-featured Monaco editor
- File tree navigation
- Integrated terminal (xterm)
- Real-time code execution
- Template library access

### Templates
Over 30 starter templates available:
- **Frontend:** React, Vue, Angular, Svelte, Astro
- **Backend:** Node, Express, Koa, Hono, Egg
- **Fullstack:** Next.js, Nuxt, SvelteKit, Vite
- **Frameworks:** GSAP, Three.js, Remotion, Slidev
- **And many more...**

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 💜 Made with Love Abdhullah Ariff 

**By [Abdullah Ariff](https://github.com/abdhullah200)**

If you find this project helpful, please consider supporting it with a ⭐ on GitHub!

---

> 💬 *"Code, create, and collaborate — all in one place."*

---
