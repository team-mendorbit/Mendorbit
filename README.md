# Mendorbit (mendorbit.in)
> **"हम टॉपर्स नहीं चुनते, हम टॉपर्स बनाते हैं!"**  
> *"We don't select toppers, we build them from the ground up."*

Welcome to the official web repository of **Mendorbit**, a transformative educational platform built with passion to teach students from absolute zero level to top ranks across school boards (Class 9 & 10) and competitive examinations (SSC CGL/CHSL, Bank PO, CLAT & AILET).

---

## 🎯 Platform Architecture & Monetization Strategy

1. **Main Domain (`mendorbit.in`)**:
   - **Purpose:** Public portal, brand awareness, batch descriptions, student contact, and educational blogs.
   - **Monetization Engine:** Google AdSense integration via high-RPM, SEO-rich educational articles and study guides.
   - **AdSense Compliance Ready:** Includes mandatory pages (`about.html`, `contact.html`, `privacy-policy.html`, `terms.html`, `disclaimer.html`, `sitemap.xml`, and `robots.txt`).
   - **Ad Slots:** Pre-configured responsive slots for header leaderboard (728x90), in-article banners, and footer banners.

2. **YouTube Channel**:
   - Free full-length foundational lectures for Class 9, Class 10, SSC, Bank PO, and CLAT.
   - Channel monetization through YouTube Partner Program (YPP) once watch hours and subscriber thresholds are met.

3. **Subdomain (`app.mendorbit.in`) [Roadmap]**:
   - Dedicated clean, distraction-free student portal for live batch tests, doubt forums, and recorded libraries.
   - Can share or inherit domain approval from `mendorbit.in`.

---

## 📁 Project Structure

```
c:\Users\Mendorbit\Documents\Mendorbit\
├── index.html                  # Official Homepage (Hero, Slogan, Batches, Ad slots, Reviews)
├── batches.html                # Detailed Batches Catalog (Class 9-10, SSC, Bank, CLAT)
├── blog.html                   # Educational Knowledge Hub / Blog Archive
├── about.html                  # Founder Story, Mission, Slogan & Core Philosophy
├── contact.html                # Student Support & Query Form
├── privacy-policy.html         # Google AdSense Compliant Privacy Policy
├── terms.html                  # Terms & Conditions
├── disclaimer.html             # Educational / Non-affiliation Disclaimer
├── sitemap.xml                 # Search Engine XML Sitemap
├── robots.txt                  # Search Engine Bot Rules
├── blogs/
│   ├── class-10-maths-science-strategy.html       # CBSE 10th Zero-to-Hero Strategy
│   ├── ssc-cgl-beginner-guide-zero-to-hero.html  # SSC CGL Master Guide for Beginners
│   └── clat-ailet-preparation-basics.html         # CLAT & AILET Reading & Legal Blueprint
└── assets/
    ├── css/
    │   └── style.css           # Custom Typography, Slogan font, Ad placeholders
    └── js/
        └── main.js             # Mobile navigation, batch filtering, FAQ accordion
```

---

## 🚀 How to Run & Preview Locally

You can open `index.html` directly in any web browser (Chrome, Edge, Firefox, Brave) right now without needing any extra software!

Alternatively, you can start a local server using PowerShell:
```powershell
# Open directly in default browser:
Start-Process "index.html"
```

---

## 💰 Google AdSense Approval Checklist

To get approved rapidly on `mendorbit.in`:
1. **Connect Custom Domain:** Purchase `mendorbit.in` (e.g. from Namecheap, GoDaddy, Hostinger) and connect it to free hosting like **Cloudflare Pages**, **GitHub Pages**, or **Vercel**.
2. **AdSense Application:** Sign up at [Google AdSense](https://adsense.google.com) and submit `mendorbit.in`.
3. **Insert AdSense Publisher Code:** Replace the commented `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXX">` with your actual client ID in `index.html`, `blog.html`, and article pages.
4. **Publish 10-15 Additional Articles:** Keep publishing weekly guides on exam dates, syllabus notes, and calculation tricks. Google loves genuine, original educational content.
