# ==============================================================================
# Mendorbit - Automated Static Blog Indexer & Metadata Synchronizer
# Zero Firebase Overhead • 0ms Instant Loading • Auto-Spotlight Sync
# ==============================================================================
param (
    [switch]$Watch
)

$ErrorActionPreference = 'Stop'
$rootPath = Resolve-Path (Join-Path $PSScriptRoot "..")
$blogsDir = Join-Path $rootPath "blogs"
$blogsDataJsPath = Join-Path $rootPath "assets\js\blogs-data.js"

function Get-CategoryInfo($relPath) {
    $folder = (Split-Path $relPath -Parent).Replace("\", "/").ToLower()
    switch -Wildcard ($folder) {
        "*law*"      { return @{ Name = "Law & BNS"; Slug = "law"; Icon = "scale" } }
        "*news*"     { return @{ Name = "Exam News"; Slug = "news"; Icon = "bell" } }
        "*notes*"    { return @{ Name = "Chapter Notes"; Slug = "notes"; Icon = "file-text" } }
        "*strategy*" { return @{ Name = "Prep Strategy"; Slug = "strategy"; Icon = "target" } }
        "*editorial*"{ return @{ Name = "Editorial"; Slug = "editorial"; Icon = "feather" } }
        "*colleges*" { return @{ Name = "Colleges"; Slug = "colleges"; Icon = "graduation-cap" } }
        "*case-study*"{ return @{ Name = "Case Studies"; Slug = "case-study"; Icon = "briefcase" } }
        Default      { return @{ Name = "Study Guides"; Slug = "all"; Icon = "sparkles" } }
    }
}

function Format-BlogDate($dateStr) {
    if (-not $dateStr) { return "Recent" }
    try {
        $dt = [DateTime]::Parse($dateStr)
        return $dt.ToString("dd MMM yyyy")
    } catch {
        return $dateStr
    }
}

function Decode-Html($str) {
    if (-not $str) { return "" }
    return [System.Net.WebUtility]::HtmlDecode($str).Trim()
}

function Sync-Blogs {
    Write-Host "[Mendorbit] Scanning static blogs in $blogsDir..." -ForegroundColor Cyan

    if (-not (Test-Path $blogsDir)) {
        Write-Warning "Blogs directory not found at $blogsDir"
        return
    }

    $htmlFiles = Get-ChildItem -Path $blogsDir -Recurse -Filter "*.html" | Where-Object {
        $_.Name -notlike "*temp*" -and $_.Name -notlike "*draft*" -and $_.Name -notlike "*.backup*"
    }

    if ($htmlFiles.Count -eq 0) {
        Write-Warning "No blog HTML files found."
        return
    }

    $blogsList = @()
    $order = 1

    # Sort files by LastWriteTime descending so newest blogs appear first
    $sortedFiles = $htmlFiles | Sort-Object LastWriteTime -Descending

    foreach ($file in $sortedFiles) {
        $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)

        # Relative link from root
        $relLink = ($file.FullName.Substring($rootPath.Path.Length).TrimStart("\", "/")).Replace("\", "/")
        
        # Category info based on subfolder
        $catInfo = Get-CategoryInfo $relLink

        # 1. Title
        $title = ""
        if ($content -match '<meta\s+property=["'']og:title["'']\s+content=["'']([^"'']+)["'']') {
            $title = $matches[1]
        } elseif ($content -match '<title>([^<]+)</title>') {
            $title = ($matches[1] -split '\|')[0].Trim()
            $title = ($title -split '–')[0].Trim()
            $title = ($title -split '-')[0].Trim()
        } elseif ($content -match '<h1[^>]*>([^<]+)</h1>') {
            $title = $matches[1].Trim()
        }
        $title = Decode-Html $title

        # 2. Description / Excerpt
        $desc = ""
        if ($content -match '<meta\s+name=["'']description["'']\s+content=["'']([^"'']+)["'']') {
            $desc = $matches[1]
        } elseif ($content -match '<meta\s+property=["'']og:description["'']\s+content=["'']([^"'']+)["'']') {
            $desc = $matches[1]
        }
        $desc = Decode-Html $desc

        # 3. Poster Image (Check figure img first for exact custom image, then og:image)
        $posterUrl = ""
        if ($content -match '<figure[^>]*>\s*<img\s+src=["'']([^"'']+)["'']') {
            $posterUrl = $matches[1]
        } elseif ($content -match '<meta\s+property=["'']og:image["'']\s+content=["'']([^"'']+)["'']') {
            $posterUrl = $matches[1]
        }
        # Normalize relative path (e.g. ../../assets/ -> assets/)
        if ($posterUrl -match '(?:\.\./)+assets/(.+)') {
            $posterUrl = "assets/" + $matches[1]
        }

        # 4. Author Name
        $author = "Mendorbit Faculty"
        if ($content -match '"author":\s*\{\s*"@type":\s*"Person",\s*"name":\s*"([^"]+)"') {
            $author = $matches[1]
        } elseif ($content -match 'class="[^"]*author[^"]*">\s*([A-Za-z\s]+)\s*<') {
            $author = $matches[1].Trim()
        }

        # 5. Date Published
        $rawDate = ""
        if ($content -match '"datePublished":\s*"([^"]+)"') {
            $rawDate = $matches[1]
        } elseif ($content -match '(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})') {
            $rawDate = $matches[1]
        }
        $formattedDate = Format-BlogDate $rawDate

        # 6. Read Time
        $readTime = "5 Min Read"
        if ($content -match '(\d+\s+Min\s+Read)') {
            $readTime = $matches[1]
        }

        # 7. Unique ID & Slug
        $slug = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $id = "blog_" + ($slug.Replace("-", "_"))

        # 8. Spotlight / Featured Flag: First 3 blogs are automatically spotlighted
        $isFeatured = ($order -le 3)

        $blogEntry = [PSCustomObject]@{
            id               = $id
            title            = $title
            category         = $catInfo.Name
            categorySlug     = $catInfo.Slug
            views            = 0
            author           = $author
            date             = $formattedDate
            readTime         = $readTime
            description      = $desc
            posterImageUrl   = $posterUrl
            link             = $relLink
            isFeatured       = $isFeatured
            active           = $true
            order            = $order
        }

        $blogsList += $blogEntry
        $order++
        Write-Host "  -> Indexed: $title ($relLink)" -ForegroundColor Green
    }

    # Generate JavaScript code for DEFAULT_BLOGS_LIST
    $jsonEntries = @()
    foreach ($b in $blogsList) {
        $entryStr = @"
  {
    id: $(ConvertTo-Json $b.id),
    title: $(ConvertTo-Json $b.title),
    category: $(ConvertTo-Json $b.category),
    categorySlug: $(ConvertTo-Json $b.categorySlug),
    views: 0,
    author: $(ConvertTo-Json $b.author),
    date: $(ConvertTo-Json $b.date),
    readTime: $(ConvertTo-Json $b.readTime),
    description: $(ConvertTo-Json $b.description),
    posterImageUrl: $(ConvertTo-Json $b.posterImageUrl),
    link: $(ConvertTo-Json $b.link),
    isFeatured: $($b.isFeatured.ToString().ToLower()),
    active: true,
    order: $($b.order)
  }
"@
        $jsonEntries += $entryStr
    }

    $newDefaultListCode = "const DEFAULT_BLOGS_LIST = [`n" + ($jsonEntries -join ",`n") + "`n];"

    # Read current blogs-data.js and replace DEFAULT_BLOGS_LIST
    if (-not (Test-Path $blogsDataJsPath)) {
        Write-Error "blogs-data.js not found at $blogsDataJsPath"
        return
    }

    $jsContent = [System.IO.File]::ReadAllText($blogsDataJsPath, [System.Text.Encoding]::UTF8)

    $pattern = '(?s)const DEFAULT_BLOGS_LIST = \[.*?\];'
    if ($jsContent -match $pattern) {
        $updatedJs = [System.Text.RegularExpressions.Regex]::Replace($jsContent, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ return $newDefaultListCode })
        [System.IO.File]::WriteAllText($blogsDataJsPath, $updatedJs, [System.Text.Encoding]::UTF8)
        Write-Host "[Mendorbit] SUCCESS: Synchronized $($blogsList.Count) blogs into $blogsDataJsPath (0ms static load)!" -ForegroundColor Green
    } else {
        Write-Warning "Could not find DEFAULT_BLOGS_LIST pattern in $blogsDataJsPath"
    }
}

# Initial Sync
Sync-Blogs

# Watch Mode
if ($Watch) {
    Write-Host "[Mendorbit] Live Watcher activated! Watching for blog changes in $blogsDir..." -ForegroundColor Yellow
    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $blogsDir
    $watcher.Filter = "*.html"
    $watcher.IncludeSubdirectories = $true
    $watcher.EnableRaisingEvents = $true

    $action = {
        param($source, $eventArgs)
        Start-Sleep -Milliseconds 200
        Sync-Blogs
    }

    Register-ObjectEvent $watcher "Changed" -Action $action | Out-Null
    Register-ObjectEvent $watcher "Created" -Action $action | Out-Null
    Register-ObjectEvent $watcher "Deleted" -Action $action | Out-Null
    Register-ObjectEvent $watcher "Renamed" -Action $action | Out-Null

    while ($true) {
        Start-Sleep -Seconds 2
    }
}
