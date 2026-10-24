# Mendorbit Developer & Git Collaboration Guide
> Professional Git & GitHub Standard Operating Procedure (SOP) for Mendorbit Engineering Team.

---

## 🏗️ 1. Project Directory Structure (Asset Management Standard)

Professional web projects follow a strict folder hierarchy so that code, images, branding assets, and documents never get mixed up:

```
c:\Users\Mendorbit\Documents\Mendorbit\
├── assets/
│   ├── css/
│   │   └── style.css            # Custom CSS, variables, AdSense styling
│   ├── js/
│   │   └── main.js              # Interactive UI scripts (filters, mobile menu)
│   ├── images/
│   │   ├── logo/                # Brand logos (logo.svg, logo.png, favicon.ico)
│   │   ├── banners/             # Hero banners, YouTube live banners, Ad placeholders
│   │   ├── courses/             # Class 9, Class 10, SSC, Banking, CLAT batch thumbnails
│   │   ├── blogs/               # Thumbnails & diagrams for blog articles
│   │   └── team/                # Mentor photos, founder portraits
│   └── docs/                    # Downloadable PDFs (Syllabus, Free formula sheets)
├── blogs/                       # In-depth SEO & AdSense articles
│   ├── class-10-maths-science-strategy.html
│   ├── ssc-cgl-beginner-guide-zero-to-hero.html
│   └── clat-ailet-preparation-basics.html
├── index.html                   # Main Landing Page
├── batches.html                 # Course Directory
├── blog.html                    # Blog Hub
├── about.html                   # Mission & Story
├── contact.html                 # Student Support
├── privacy-policy.html          # AdSense Legal
├── terms.html                   # AdSense Legal
├── disclaimer.html              # AdSense Legal
├── sitemap.xml                  # Google Search Engine Sitemap
├── robots.txt                   # Googlebot Crawler Rules
├── .gitignore                   # Ignore OS files, temp files & cache
└── .editorconfig                # Universal indentation & code format standard
```

---

## 🔗 2. GitHub Pe Pehli Baar Kaise Link Karein (First-Time Setup)

### Step 1: GitHub par New Repository banayein
1. Apne browser me **[github.com](https://github.com)** open karein aur login karein.
2. Top-right me **`+`** icon par click karein -> **New repository**.
3. **Repository name:** `mendorbit`
4. **Visibility:** `Public` (agar open-source rakhna chahein) ya `Private` (agar code secretly rakhna chahein).
5. ⚠️ **Dhyan dein:** "Add a README file", ".gitignore", ya "License" par tick **NA karein** (kyunki humne already apne local project me ye sab bana liya hai).
6. **Create repository** button par click karein.

### Step 2: VS Code Terminal se Link Karein
VS Code me Terminal kholein (`Ctrl + ~` ya Menu > Terminal > New Terminal) aur ye 2 commands chalayein:

```powershell
# 1. Apne GitHub repo ka URL add karein (apna username daalein):
git remote add origin https://github.com/APNA_GITHUB_USERNAME/mendorbit.git

# 2. Main branch ko GitHub par push karein:
git push -u origin main
```
*(First time me GitHub aapke browser me ek popup kholega login/authorize karne ke liye. Uspe "Authorize" click kar dena).*

---

## 💻 3. VS Code Me "Publish Branch" Aur Commit Message Kya Likhein?

Jab aap VS Code ke left side me **Source Control** icon (3 dots wala branch icon) par click karte hain:

### Commit Message Rules (Conventional Commits Standard)
Professional senior engineers kabhi bhi *"changes made"*, *"update"*, ya *"file add"* jaise random messages nahi likhte. Hamesha standard format use hota hai:

`type: short description`

| Type | Kab Use Karna Hai? | Example Commit Message |
| :--- | :--- | :--- |
| `feat:` | Jab koi naya feature, naya page, ya naya batch add kiya ho | `feat: add Class 9 foundation batch details in batches.html` |
| `fix:` | Jab koi link broken ho, styling glitch ho, ya spell check fix kiya ho | `fix: resolve mobile navigation toggle issue on iPhone` |
| `docs:` | Jab blog article, study notes ya README me likha ho | `docs: publish new SSC CGL syllabus breakdown article` |
| `style:` | Jab sirf CSS color, spacing, padding ya font change kiya ho | `style: update primary button color to match orange accent` |
| `refactor:` | Jab code ko saaf kiya ho bina kisi naye feature ke | `refactor: optimize image loading performance and tags` |
| `chore:` | Jab folder structure ya config files (.gitignore) update ki ho | `chore: setup professional asset directories for banners and team` |

---

## 👥 4. Doosre Laptop Ya Team Member Ke Sath Kaam Karne Ka Rule

Jab aapka bhai ya partner kisi doosre laptop se kaam karega, to ZIP file bhejne ki bilkul zaroorat nahi hai:

### Partner ke laptop me (Sirf Ek Baar):
```powershell
git clone https://github.com/APNA_GITHUB_USERNAME/mendorbit.git
```

### Daily Kaam Karne Ka Golden Rule (The 3-Step Rhythm):

1. **Kaam shuru karne se pehle (Always Pull First):**
   ```powershell
   git pull origin main
   ```
   *(Isse doosre laptop pe jo naya kaam hua tha, wo turant aapke laptop me aa jayega).*

2. **Apna code likhein aur test karein.**

3. **Kaam khatam hone par (Commit & Push):**
   ```powershell
   git add .
   git commit -m "feat: add registration modal on index.html"
   git push origin main
   ```

Aapka code turant GitHub par update ho jayega aur Cloudflare Pages / Hosting par bina ek second ruke automatic live ho jayega!
