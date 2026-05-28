"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { useAdmin } from "@/components/admin/admin-context";

// ---- Types ----
type PostStatus = "published" | "draft" | "scheduled" | "review";
type PostCategory = "regulatory" | "compliance" | "scholarship" | "guide" | "news";

interface Post {
  title: string;
  excerpt: string;
  category: PostCategory;
  status: PostStatus;
  date: string;
  views: number | null;
}

// ---- Status pill ----
function StatusPill({ status }: { status: PostStatus }) {
  const cfg: Record<PostStatus, { bg: string; dot: string; label: string }> = {
    published: { bg: "bg-success/[0.08] text-success", dot: "bg-success", label: "Published" },
    draft: { bg: "bg-muted/10 text-muted", dot: "bg-muted", label: "Draft" },
    scheduled: { bg: "bg-gold/10 text-gold", dot: "bg-gold", label: "Scheduled" },
    review: { bg: "bg-navy/[0.08] text-navy-light", dot: "bg-navy-light", label: "In Review" },
  };
  const c = cfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-[10px] py-[3px] rounded-full text-[0.72rem] font-semibold ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ---- Category tag ----
function CatTag({ cat }: { cat: PostCategory }) {
  const cfg: Record<PostCategory, { bg: string; label: string }> = {
    regulatory: { bg: "bg-danger/[0.08] text-danger", label: "Regulatory" },
    compliance: { bg: "bg-navy/[0.08] text-navy", label: "Compliance" },
    scholarship: { bg: "bg-gold/10 text-gold", label: "Scholarship" },
    guide: { bg: "bg-success/[0.08] text-success", label: "Guide" },
    news: { bg: "bg-muted/10 text-muted", label: "News" },
  };
  const c = cfg[cat];
  return (
    <span className={`text-[0.72rem] font-semibold px-[9px] py-[2px] rounded ${c.bg}`}>
      {c.label}
    </span>
  );
}

// ---- Sample posts ----
const POSTS: Post[] = [
  { title: "Florida DCF Licensing Requirements: A Complete Guide for ECE Providers", excerpt: "Everything Florida childcare centers and ECE providers need to know about DCF licensing under Chapter 402 F.S. and F.A.C. 65C-22.", category: "compliance", status: "published", date: "Apr 7, 2026", views: 842 },
  { title: "HB 765 Explained: What the School-Operated Program Carve-Out Means for You", excerpt: "Breaking down HB 765 / SB 1690 and what school-operated program operators need to know before July 1, 2026.", category: "regulatory", status: "published", date: "Apr 3, 2026", views: 621 },
  { title: "Step Up for Students: Compliance Requirements Your School Needs to Track", excerpt: "A breakdown of FTC, FES-EO, and Gardiner scholarship compliance obligations for participating schools.", category: "scholarship", status: "published", date: "Mar 28, 2026", views: 394 },
  { title: "Background Screening Renewal: Your 5-Year Level 2 Timeline", excerpt: "How to calculate your Level 2 background screening renewal date and what to do before it expires.", category: "guide", status: "scheduled", date: "Apr 16, 2026", views: null },
  { title: "DCF Violation Tiers: Understanding Class 1, 2, and 3 Violations", excerpt: "What each violation class means, common examples, and how to prevent them at your program.", category: "compliance", status: "draft", date: "Apr 5, 2026", views: null },
  { title: "VPK Provider Compliance Checklist for 2026–2027", excerpt: "A downloadable checklist covering all VPK provider requirements for the upcoming program year.", category: "guide", status: "draft", date: "Apr 1, 2026", views: null },
  { title: "Compleros Platform Update: Free Tier Now Available", excerpt: "Announcing the launch of the Compleros Free tier for all Florida ECE providers.", category: "news", status: "scheduled", date: "Apr 21, 2026", views: null },
];

// ---- Editor Panel ----
function EditorPanel({
  post,
  onClose,
  onSave,
}: {
  post: Post | null;
  onClose: () => void;
  onSave: (status: "draft" | "published") => void;
}) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [tags, setTags] = useState<string[]>(["DCF", "Florida"]);
  const [tagInput, setTagInput] = useState("");
  const [seoOpen, setSeoOpen] = useState(false);
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [slug, setSlug] = useState(
    post ? post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").substring(0, 60) : ""
  );
  const [metaDesc, setMetaDesc] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").substring(0, 60));
  };

  const handleTagKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
      e.preventDefault();
    }
  };

  const providerTypes = ["All Providers", "Childcare Centers", "Private Schools", "Microschools", "Before/After School", "VPK Providers"];
  const [activeTypes, setActiveTypes] = useState<string[]>(["All Providers"]);

  const toggleType = (t: string) => setActiveTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-7 py-5 bg-white border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-[1.15rem] font-normal text-navy">
            {post ? "Edit Resource" : "New Resource"}
          </h2>
          <StatusPill status={status} />
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center border border-border rounded-[6px] text-muted hover:border-navy hover:text-navy transition-all"
        >
          <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-[#F7F5F0]">
        <div className="px-7 py-6 space-y-5">
          {/* Title */}
          <input
            className="w-full font-heading text-[1.3rem] text-navy bg-transparent border border-transparent rounded-lg px-4 py-3 outline-none focus:border-border focus:bg-white placeholder:text-cream-dark transition-all"
            placeholder="Write your title here..."
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />

          {/* Meta row */}
          <div className="grid grid-cols-3 gap-3.5">
            {[
              { label: "Category", options: ["Regulatory Update", "Compliance Guide", "Scholarship", "How-To Guide", "Platform News"] },
              { label: "Content Type", options: ["Blog Post", "Resource Guide", "Checklist", "Toolkit", "Regulatory Alert"] },
              { label: "Author", options: ["Compleros Team", "Steph Darilus"] },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-1.5">
                <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">{f.label}</label>
                <select className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] bg-white outline-none focus:border-navy appearance-none cursor-pointer">
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Featured image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Featured Image</label>
            <div className="border-2 border-dashed border-border rounded-xl p-7 text-center cursor-pointer hover:border-navy hover:bg-navy/[0.03] transition-all bg-white">
              <svg className="w-7 h-7 text-muted mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <p className="text-[0.84rem] text-muted">
                <strong className="text-navy">Click to upload</strong> or drag and drop
                <br /><span className="text-[0.78rem]">PNG, JPG up to 2MB — 1200×630 recommended</span>
              </p>
            </div>
          </div>

          {/* Content editor */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Content</label>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 px-3 py-2 bg-white border border-border rounded-t-lg">
              {["B", "I", "U"].map((t) => (
                <button key={t} className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:bg-cream hover:text-navy text-[0.82rem] font-semibold transition-all">
                  {t === "B" ? <strong>B</strong> : t === "I" ? <em>I</em> : <u>U</u>}
                </button>
              ))}
              <div className="w-px h-5 bg-border mx-1.5" />
              {["H2", "H3"].map((t) => (
                <button key={t} className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:bg-cream hover:text-navy text-[0.78rem] font-semibold transition-all">{t}</button>
              ))}
              <div className="w-px h-5 bg-border mx-1.5" />
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:bg-cream hover:text-navy transition-all">
                <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:bg-cream hover:text-navy transition-all">
                <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" />
                  <path d="M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                </svg>
              </button>
              <div className="w-px h-5 bg-border mx-1.5" />
              <button className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:bg-cream hover:text-navy transition-all">
                <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
              </button>
            </div>
            <textarea
              className="w-full min-h-[240px] px-4 py-4 border border-border border-t-0 rounded-b-lg text-[0.92rem] text-navy font-body leading-relaxed resize-y outline-none bg-white focus:border-navy transition-colors placeholder:text-muted/60"
              placeholder={`Write your content here. Use the toolbar above for formatting.\n\nTip: Include a CTA block to link readers to the Compleros platform signup.`}
              defaultValue={post ? "Content loaded from database..." : ""}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Tags</label>
            <div className="flex flex-wrap gap-1.5 items-center px-3 py-2 border border-border rounded-lg bg-white min-h-[42px] focus-within:border-navy transition-colors">
              {tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-[10px] py-[3px] bg-navy/[0.07] rounded-md text-[0.78rem] font-medium text-navy">
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))} className="text-muted hover:text-danger transition-colors leading-none ml-0.5">×</button>
                </span>
              ))}
              <input
                className="border-none outline-none bg-transparent text-[0.84rem] flex-1 min-w-[80px] placeholder:text-muted"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
              />
            </div>
          </div>

          {/* Target provider types */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Target Provider Types</label>
            <div className="flex flex-wrap gap-1.5">
              {providerTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`px-[14px] py-[6px] border rounded-full text-[0.78rem] font-medium transition-all ${
                    activeTypes.includes(t)
                      ? "bg-navy text-cream border-navy"
                      : "bg-white text-muted border-border hover:border-navy hover:text-navy"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SEO section */}
          <div className="border border-border rounded-xl bg-white overflow-hidden">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="w-full px-[18px] py-3.5 flex items-center justify-between hover:bg-cream/30 transition-colors"
            >
              <span className="flex items-center gap-2 text-[0.78rem] font-semibold text-muted">
                <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
                SEO & Sharing
              </span>
              <span className={`text-muted transition-transform duration-200 ${seoOpen ? "rotate-180" : ""}`}>▼</span>
            </button>
            {seoOpen && (
              <div className="px-[18px] pb-[18px] space-y-3.5 border-t border-border">
                {/* Preview */}
                <div className="mt-3.5 bg-cream rounded-lg px-4 py-3.5">
                  <p className="text-[1rem] font-semibold text-navy-light mb-0.5">{title || "Your Title Will Appear Here"}</p>
                  <p className="text-[0.76rem] text-success mb-1">compleros.com/resources/{slug || "your-slug"}</p>
                  <p className="text-[0.8rem] text-muted leading-snug">{metaDesc || "Your meta description will preview here as it would appear in search results..."}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">URL Slug</label>
                  <input
                    className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] outline-none focus:border-navy transition-colors"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="auto-generated-from-title"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">
                    Meta Description <span className="font-normal opacity-60">(155 chars max)</span>
                  </label>
                  <textarea
                    className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.84rem] leading-relaxed resize-y outline-none focus:border-navy transition-colors"
                    rows={2}
                    maxLength={155}
                    placeholder="A concise summary for search engines..."
                    value={metaDesc}
                    onChange={(e) => setMetaDesc(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Publish settings */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Publish Date</label>
              <input type="date" defaultValue="2026-04-14" className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] outline-none focus:border-navy bg-white" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.72rem] uppercase tracking-[0.08em] text-muted font-semibold">Status</label>
              <select
                className="w-full px-[14px] py-[9px] border border-border rounded-lg text-[0.88rem] bg-white outline-none focus:border-navy appearance-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
              >
                <option value="draft">Draft</option>
                <option value="review">Ready for Review</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-7 py-4 bg-white border-t border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-[0.76rem] text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          Auto-saved
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSave("draft")}
            className="flex items-center gap-1.5 px-[18px] py-2 border border-border rounded-lg text-[0.82rem] font-medium text-muted hover:border-navy hover:text-navy transition-all"
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
          <button
            onClick={() => onSave("draft")}
            className="px-[18px] py-2 border border-border rounded-lg text-[0.82rem] font-medium text-muted hover:border-navy hover:text-navy transition-all"
          >
            Save Draft
          </button>
          <button
            onClick={() => onSave("published")}
            className="flex items-center gap-1.5 px-[18px] py-2 bg-navy text-cream rounded-lg text-[0.82rem] font-semibold hover:bg-navy-dark transition-all"
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function AdminResources() {
  const { showToast } = useAdmin();
  const [activeFilter, setActiveFilter] = useState<"all" | PostStatus>("all");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const openEditor = (post: Post | null = null) => {
    setEditingPost(post);
    setEditorOpen(true);
  };

  const closeEditor = () => setEditorOpen(false);

  const handleSave = (status: "draft" | "published") => {
    const name = editingPost?.title ?? "Untitled";
    showToast(status === "published" ? `"${name}" published to resource page` : `"${name}" saved as draft`);
    closeEditor();
  };

  const filteredPosts = POSTS.filter((p) => {
    const matchesFilter = activeFilter === "all" || p.status === activeFilter;
    const matchesSearch = search === "" || p.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: POSTS.length,
    published: POSTS.filter((p) => p.status === "published").length,
    draft: POSTS.filter((p) => p.status === "draft").length,
    scheduled: POSTS.filter((p) => p.status === "scheduled").length,
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
        <div>
          <h1 className="font-heading text-[1.3rem] font-normal text-navy">Resources & Blog</h1>
          <p className="text-[0.76rem] text-muted">
            <a href="/admin/dashboard" className="text-navy-light hover:underline">Dashboard</a>
            {" / "}Resources & Blog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => showToast("Opening resource page — compleros.com/resources")}
            className="flex items-center gap-1.5 px-[18px] py-2 border border-border rounded-lg text-[0.82rem] font-medium text-muted hover:border-navy hover:text-navy transition-all"
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <polyline points="15,3 21,3 21,9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            View Resource Page
          </button>
          <button
            onClick={() => openEditor(null)}
            className="flex items-center gap-1.5 px-[18px] py-2 bg-navy text-cream text-[0.82rem] font-semibold rounded-lg hover:bg-navy-dark transition-all hover:-translate-y-px hover:shadow-md"
          >
            <svg className="w-[14px] h-[14px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
            New Resource
          </button>
        </div>
      </header>

      <div className="px-8 py-7 pb-12 space-y-5">

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { label: "Total Resources", value: "18", change: "+3 this month", onClick: () => setActiveFilter("all") },
            { label: "Published", value: "12", change: null, onClick: () => setActiveFilter("published") },
            { label: "Drafts", value: "4", change: null, onClick: () => setActiveFilter("draft") },
            { label: "Page Views (30d)", value: "2,840", change: "↑ 24%", onClick: () => showToast("Resource page had 2,840 views this month") },
          ].map((s, i) => (
            <button
              key={i}
              onClick={s.onClick}
              className="bg-white border border-border rounded-xl p-4 text-left hover:shadow-md hover:border-navy hover:-translate-y-px transition-all"
            >
              <p className="text-[0.72rem] uppercase tracking-[0.07em] text-muted font-semibold mb-1.5">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-[1.5rem] text-navy leading-none">{s.value}</span>
                {s.change && (
                  <span className="text-[0.72rem] font-semibold px-[7px] py-[1px] rounded-full bg-success/10 text-success">
                    {s.change}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 px-[14px] py-2 border border-border rounded-lg bg-white flex-1 min-w-[200px] max-w-[340px] focus-within:border-navy focus-within:ring-2 focus-within:ring-navy/[0.08] transition-all">
            <svg className="w-[14px] h-[14px] text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              className="border-none outline-none bg-transparent text-[0.84rem] w-full placeholder:text-muted"
              placeholder="Search resources..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Filter pills */}
          <div className="flex gap-1.5">
            {(["all", "published", "draft", "scheduled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-[14px] py-[6px] border rounded-full text-[0.78rem] font-medium transition-all ${
                  activeFilter === f ? "bg-navy text-cream border-navy" : "bg-white text-muted border-border hover:border-navy hover:text-navy"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="ml-1 opacity-60 text-[0.68rem] font-bold">
                  {f === "all" ? counts.all : counts[f as keyof typeof counts] ?? 0}
                </span>
              </button>
            ))}
          </div>
          {/* Category filter */}
          <div className="ml-auto">
            <select
              className="px-3 py-[7px] border border-border rounded-lg text-[0.78rem] bg-white outline-none focus:border-navy appearance-none cursor-pointer"
              onChange={(e) => showToast("Filtered by: " + e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="regulatory">Regulatory Updates</option>
              <option value="compliance">Compliance Guides</option>
              <option value="scholarship">Scholarship</option>
              <option value="guide">How-To Guides</option>
              <option value="news">Platform News</option>
            </select>
          </div>
        </div>

        {/* Content table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-cream/25">
                {[
                  { label: "Title", w: "w-[38%]" },
                  { label: "Category", w: "" },
                  { label: "Status", w: "" },
                  { label: "Date", w: "" },
                  { label: "Views", w: "" },
                  { label: "", w: "w-[90px]" },
                ].map((h, i) => (
                  <th key={i} className={`text-left text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted px-4 py-3 border-b border-border ${h.w}`}>
                    {h.label && (
                      <span className="cursor-pointer hover:text-navy transition-colors after:content-['_↕'] after:opacity-30 after:text-[0.6rem]">
                        {h.label}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post, i) => (
                <tr
                  key={i}
                  onClick={() => openEditor(post)}
                  className="cursor-pointer border-b border-border/50 last:border-0 hover:bg-navy/[0.025] transition-colors group"
                >
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-navy text-[0.9rem] leading-snug group-hover:text-navy-light group-hover:underline transition-colors">
                        {post.title}
                      </span>
                      <span className="text-[0.76rem] text-muted leading-snug line-clamp-1">
                        {post.excerpt}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <CatTag cat={post.category} />
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusPill status={post.status} />
                  </td>
                  <td className="px-4 py-3.5 text-[0.86rem] text-muted whitespace-nowrap">{post.date}</td>
                  <td className="px-4 py-3.5 text-[0.86rem]">
                    {post.views !== null ? (
                      <span className="font-semibold text-navy">{post.views.toLocaleString()}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Edit */}
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditor(post); }}
                        className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-border bg-white text-muted hover:border-navy hover:text-navy hover:bg-navy/[0.05] transition-all"
                      >
                        <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      {/* Duplicate */}
                      <button
                        onClick={(e) => { e.stopPropagation(); showToast("Post duplicated as draft"); }}
                        className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-border bg-white text-muted hover:border-navy hover:text-navy hover:bg-navy/[0.05] transition-all"
                      >
                        <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button
                        onClick={(e) => { e.stopPropagation(); showToast("Post moved to trash"); }}
                        className="w-[30px] h-[30px] rounded-md flex items-center justify-center border border-border bg-white text-muted hover:border-danger hover:text-danger hover:bg-danger/[0.05] transition-all"
                      >
                        <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6" />
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted text-[0.88rem]">
                    No resources found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-4 py-3.5 border-t border-border">
            <span className="text-[0.78rem] text-muted">
              Showing {filteredPosts.length} of {POSTS.length} resources
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  onClick={() => showToast(`Loading page ${p}`)}
                  className={`w-[30px] h-[30px] flex items-center justify-center border rounded-md text-[0.78rem] font-semibold transition-all ${
                    p === 1 ? "bg-navy text-cream border-navy" : "bg-white text-muted border-border hover:border-navy hover:text-navy"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => showToast("Loading next page")}
                className="w-[30px] h-[30px] flex items-center justify-center border border-border rounded-md text-[0.78rem] font-semibold text-muted hover:border-navy hover:text-navy bg-white transition-all"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor slide panel */}
      <>
        <div
          className={`fixed inset-0 bg-[rgba(27,43,56,0.4)] z-[300] backdrop-blur-[3px] transition-opacity duration-250 ${
            editorOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={closeEditor}
        />
        <div
          className={`fixed top-0 right-0 bottom-0 w-[680px] max-w-[96vw] z-[310] flex flex-col shadow-[-8px_0_40px_rgba(27,77,107,0.15)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            editorOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <EditorPanel post={editingPost} onClose={closeEditor} onSave={handleSave} />
        </div>
      </>
    </div>
  );
}
