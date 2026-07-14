import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, BookOpen, Flame, Zap, Shield, FileText, 
  Search, User, Calendar, Heart, Eye, Play, 
  Trash2, PlusCircle, ArrowUpRight, FileDown, 
  Clock, X, ChevronRight, Upload, AlertCircle, Sparkles, CheckCircle2,
  Phone, Mail, Lock
} from 'lucide-react';

// Design Theme Colors:
// - Forest Green: text-emerald-800, bg-emerald-900, border-emerald-800
// - Coral Red / "FULL": bg-red-500, text-red-500, hover:bg-red-600
// - Sunny Gold: text-amber-500, bg-amber-100

// Types defined beautifully
interface Post {
  id: string;
  category: string; // 교과수업, 스포츠클럽, 체육대회, 내가 바로 원곡 릴스꾼, 연구학교, 학생심판지원단(기자단)
  title: string;
  author: string;
  content: string;
  date: string;
  fileUrl?: string;
  fileData?: string;
  linkUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  views: number;
  isFlagged?: boolean;
  flaggedReason?: string;
}

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  mediaUrl: string;
  uploader: string;
  date: string;
  likes: number;
  isFlagged?: boolean;
  flaggedReason?: string;
}

interface Rental {
  id: string;
  name: string;
  total: number;
  rented: number;
  renter?: string;
  classRoom?: string;
}

interface Match {
  id: string;
  sport: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: 'scheduled' | 'playing' | 'finished';
  time: string;
}

// Custom SVG Logo Component that accurately reproduces the provided physical badge design!
function WongokLogo({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg 
      id="wongok-sports-badge-logo"
      viewBox="0 0 400 400" 
      className={`${className} select-none drop-shadow-md transition-transform duration-500 hover:rotate-6`}
    >
      {/* Outer elegant silver/grey ring */}
      <circle cx="200" cy="200" r="192" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="4" />
      <circle cx="200" cy="200" r="182" fill="#ffffff" stroke="#d1d5db" strokeWidth="1.5" />
      
      {/* Primary Forest Green middle badge ring */}
      <circle cx="200" cy="200" r="170" fill="#2d6a4f" stroke="#1b4332" strokeWidth="3.5" />
      <circle cx="200" cy="200" r="130" fill="#f8fafc" stroke="#2d6a4f" strokeWidth="2" />
      
      {/* Path strings for embedding curved text exactly inside the deep green banner */}
      <path id="top-text-arc" d="M 58,200 A 142,142 0 1,1 342,200" fill="none" stroke="none" />
      <path id="bottom-text-arc" d="M 342,200 A 142,142 0 0,1 58,200" fill="none" stroke="none" />
      
      <text className="font-sans font-black tracking-widest fill-white text-[17px]">
        <textPath href="#top-text-arc" startOffset="50%" textAnchor="middle">
          WONGOK MIDDLE SCHOOL
        </textPath>
      </text>
      
      <text className="font-sans font-black tracking-widest fill-white text-[15px]">
        <textPath href="#bottom-text-arc" startOffset="50%" textAnchor="middle">
          SPORTS SUPPORT TEAM
        </textPath>
      </text>
      
      {/* Distinct left and right green leaves on the banner rim */}
      <g transform="translate(45, 185) scale(0.6)">
        <path d="M15,0 C25,-5 35,-5 40,5 C40,25 20,40 15,45 C10,40 -10,25 15,0 Z" fill="#52b788" />
      </g>
      <g transform="translate(332, 185) scale(0.6)">
        <path d="M15,0 C25,-5 35,-5 40,5 C40,25 20,40 15,45 C10,40 -10,25 15,0 Z" fill="#52b788" />
      </g>
      
      {/* Inner Central Area Design */}
      
      {/* 1. Yellow Sunny Sunrise representing school energy */}
      <g transform="translate(200, 195) scale(0.85)">
        <path d="M-35,10 C-35,-25 35,-25 35,10 Z" fill="#ffb703" stroke="#e08500" strokeWidth="1" />
        <circle cx="0" cy="10" r="26" fill="#fb8500" />
        {/* Beaming rays */}
        <line x1="0" y1="-20" x2="0" y2="-36" stroke="#fb8500" strokeWidth="3" strokeLinecap="round" />
        <line x1="-18" y1="-15" x2="-28" y2="-27" stroke="#fb8500" strokeWidth="3" strokeLinecap="round" />
        <line x1="18" y1="-15" x2="28" y2="-27" stroke="#fb8500" strokeWidth="3" strokeLinecap="round" />
        <line x1="-25" y1="5" x2="-37" y2="2" stroke="#fb8500" strokeWidth="3" strokeLinecap="round" />
        <line x1="25" y1="5" x2="37" y2="2" stroke="#fb8500" strokeWidth="3" strokeLinecap="round" />
      </g>
      
      {/* 2. Delicate Sports Tennis/Grid Racket on the right */}
      <g transform="translate(272, 205) rotate(18) scale(0.6)">
        <ellipse cx="0" cy="0" rx="22" ry="29" fill="#f8fafc" stroke="#2d6a4f" strokeWidth="4.5" />
        <path d="M-10,-24 L10,24 M-18,-12 L18,12 M-18,12 L18,-12 M-10,24 L10,-24 M0,-29 L0,29 M-22,0 L22,0" stroke="#a3b19b" strokeWidth="1.5" />
        <rect x="-4" y="29" width="8" height="40" rx="3" fill="#ffb703" stroke="#e08500" strokeWidth="2" />
        <path d="M-10,27 L0,34 L10,27" fill="none" stroke="#2d6a4f" strokeWidth="3.5" />
      </g>
      
      {/* 3. Rolling organic green shrubs/grass on left */}
      <g transform="translate(110, 195) scale(0.65)">
        <path d="M10,25 C0,8 25,-10 38,5 C45,-8 68,-3 72,12 C78,2 96,2 100,25 Z" fill="#52b788" />
      </g>
      
      {/* 4. Little decorative flora stars on borders */}
      <g transform="translate(116, 155) scale(0.6)">
        <circle cx="10" cy="10" r="5" fill="#f26419" />
        <circle cx="10" cy="2" r="3.5" fill="#f6bd60" />
        <circle cx="10" cy="18" r="3.5" fill="#f6bd60" />
        <circle cx="2" cy="10" r="3.5" fill="#f6bd60" />
        <circle cx="18" cy="10" r="3.5" fill="#f6bd60" />
      </g>
      <g transform="translate(264, 155) scale(0.6)">
        <circle cx="10" cy="10" r="5" fill="#e63946" />
        <circle cx="10" cy="2" r="3.5" fill="#ffb703" />
        <circle cx="10" cy="18" r="3.5" fill="#ffb703" />
        <circle cx="2" cy="10" r="3.5" fill="#ffb703" />
        <circle cx="18" cy="10" r="3.5" fill="#ffb703" />
      </g>
      
      {/* 5. Blooming top crimson tulip icon */}
      <g transform="translate(182, 102) scale(0.85)">
        <path d="M10,25 C-6,8 5,-8 20,4 C35,-8 46,8 30,25" fill="#e63946" stroke="#b7094c" strokeWidth="1" />
        <path d="M20,6 L20,25" stroke="#f6bd60" strokeWidth="2" />
        <circle cx="20" cy="4" r="3.5" fill="#f6bd60" />
      </g>
      
      {/* 6. Dynamic Hangeul title: "원더풀" */}
      <text x="200" y="162" textAnchor="middle" className="font-sans font-black text-[44px] tracking-tight fill-emerald-800 filter drop-shadow">
        원더풀
      </text>
      
      {/* 7. Subtitle: 'WON THE' */}
      <text x="200" y="188" textAnchor="middle" className="font-serif italic font-extrabold text-[19px] fill-amber-700 tracking-wide">
        WON THE
      </text>
      
      {/* 8. Super bold RED-CORAL ribbon badge "FULL" */}
      <rect x="110" y="198" width="180" height="52" rx="14" fill="#e63946" stroke="#b7094c" strokeWidth="1.5" />
      <text x="200" y="237" textAnchor="middle" className="font-sans font-black tracking-widest text-[38px] fill-white drop-shadow">
        FULL
      </text>
      
      {/* 9. Golden bottom crest curl ribbon */}
      <g transform="translate(155, 258) scale(0.8)">
        <path d="M10,12 C40,-5 80,5 100,12 C90,20 50,22 10,12 Z" fill="#ffb703" stroke="#f26419" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

export default function App() {
  // App navigation state: 'home' | 'class' | 'club' | 'festival' | 'oasis' | 'research' | 'referee' | 'gallery'
  const [activeTab, setActiveTab] = useState<string>('home');

  // Role and Authentication states
  const [userRole, setUserRole] = useState<'student' | 'student_council' | 'admin'>('student');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [selectedAuthRole, setSelectedAuthRole] = useState<'student_council' | 'admin'>('student_council');
  const [authPasscode, setAuthPasscode] = useState<string>('');
  const [showDebugHint, setShowDebugHint] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('hint') || 
             window.location.search.includes('dev') || 
             window.location.search.includes('dn90961510');
    }
    return false;
  });
  const [labelClickCount, setLabelClickCount] = useState<number>(0);
  
  // Storage arrays
  const [posts, setPosts] = useState<Post[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  
  // UI helper states
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  
  // Feedback messages
  const [hudMessage, setHudMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  
  // Action Modals
  const [showAddPostModal, setShowAddPostModal] = useState<boolean>(false);
  const [showAddMediaModal, setShowAddMediaModal] = useState<boolean>(false);
  const [showRentalModal, setShowRentalModal] = useState<boolean>(false);
  const [showAddMatchModal, setShowAddMatchModal] = useState<boolean>(false);
  
  // Form states - Post
  const [newPostCategory, setNewPostCategory] = useState<string>('교과수업');
  const [newPostTitle, setNewPostTitle] = useState<string>('');
  const [newPostAuthor, setNewPostAuthor] = useState<string>('');
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [newPostFileUrl, setNewPostFileUrl] = useState<string>('');
  const [newPostFileData, setNewPostFileData] = useState<string>('');
  const [newPostLinkUrl, setNewPostLinkUrl] = useState<string>('');
  const [newPostImageUrl, setNewPostImageUrl] = useState<string>('');
  const [newPostVideoUrl, setNewPostVideoUrl] = useState<string>('');
  const postImageFileInputRef = useRef<HTMLInputElement>(null);
  const postDocumentFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRefereeSport, setSelectedRefereeSport] = useState<string>('soccer');
  const [postModalTab, setPostModalTab] = useState<'add' | 'edit'>('add');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  
  // Form states - Media
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [newMediaTitle, setNewMediaTitle] = useState<string>('');
  const [newMediaDesc, setNewMediaDesc] = useState<string>('');
  const [newMediaUrl, setNewMediaUrl] = useState<string>('');
  const [newMediaUploader, setNewMediaUploader] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states - Gear renting
  const [activeRentalItem, setActiveRentalItem] = useState<Rental | null>(null);
  const [renterName, setRenterName] = useState<string>('');
  const [renterClass, setRenterClass] = useState<string>('');
  
  // Form states - Match Scoreboard
  const [newMatchSport, setNewMatchSport] = useState<string>('축구');
  const [newMatchTeamA, setNewMatchTeamA] = useState<string>('');
  const [newMatchTeamB, setNewMatchTeamB] = useState<string>('');
  const [newMatchTime, setNewMatchTime] = useState<string>('');

  // Ticker text
  const [tickerIndex, setTickerIndex] = useState<number>(0);
  const tickers = [
    "🏆 [체육대회] 2026 원더풀 스포츠 페스티벌 세부 종목 및 배점 가이드 개정 배포 완료!",
    "⚽ [오아시스] 2교시 쉬는 시간 3학년 축구 결상 매치 - 3반 vs 6반 정오 13시 킥오프!",
    "📌 [학생심판지원단(기자단)] 금일 점심시간 경기 담당 학생 심판진 전원 12:40분 체육부실 소집 요망.",
    "🔬 [연구학교] 생체신호 모니터링 스마트 디바이스 1학년 2반 시범 체육 수업 진행 중"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickers.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Fetch all data from API or load placeholders on error
  const triggerHud = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setHudMessage({ text, type });
    setTimeout(() => setHudMessage(null), 3000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const postsRes = await fetch('/api/posts');
      const galleryRes = await fetch('/api/gallery');
      const rentalsRes = await fetch('/api/rentals');
      const matchesRes = await fetch('/api/matches');
      
      if (postsRes.ok) setPosts(await postsRes.json());
      if (galleryRes.ok) setGallery(await galleryRes.json());
      if (rentalsRes.ok) setRentals(await rentalsRes.json());
      if (matchesRes.ok) setMatches(await matchesRes.json());
    } catch (err) {
      console.warn("Express server unreachable, using local storage/mock state fallback.", err);
      // Try local storage
      const cachedPosts = localStorage.getItem('wongok_posts');
      const cachedGallery = localStorage.getItem('wongok_gallery');
      const cachedRentals = localStorage.getItem('wongok_rentals');
      const cachedMatches = localStorage.getItem('wongok_matches');
      
      if (cachedPosts) setPosts(JSON.parse(cachedPosts));
      if (cachedGallery) setGallery(JSON.parse(cachedGallery));
      if (cachedRentals) setRentals(JSON.parse(cachedRentals));
      if (cachedMatches) setMatches(JSON.parse(cachedMatches));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Save to locale cache if express connection fails
  const updatePostsState = (updatedList: Post[]) => {
    setPosts(updatedList);
    localStorage.setItem('wongok_posts', JSON.stringify(updatedList));
  };

  const updateGalleryState = (updatedList: GalleryItem[]) => {
    setGallery(updatedList);
    localStorage.setItem('wongok_gallery', JSON.stringify(updatedList));
  };

  const updateRentalsState = (updatedList: Rental[]) => {
    setRentals(updatedList);
    localStorage.setItem('wongok_rentals', JSON.stringify(updatedList));
  };

  const updateMatchesState = (updatedList: Match[]) => {
    setMatches(updatedList);
    localStorage.setItem('wongok_matches', JSON.stringify(updatedList));
  };

  // Submit operations
  const handlePostImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      triggerHud("최대 8MB 용량 파일만 가능합니다.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPostImageUrl(reader.result as string);
      triggerHud("로컬 사진 분석 완료! 업로드 시 함께 저장됩니다.");
    };
    reader.readAsDataURL(file);
  };

  const handlePostDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      triggerHud("최대 15MB 용량 파일만 가능합니다.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewPostFileUrl(file.name);
      setNewPostFileData(reader.result as string);
      triggerHud(`"${file.name}" 문서가 성공적으로 첨부되었습니다.`);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle || !newPostContent) {
      triggerHud("제목과 내용을 입력해주세요.", "error");
      return;
    }
    
    const payload = {
      category: newPostCategory,
      title: newPostTitle,
      author: newPostAuthor || "원곡중 구성원",
      content: newPostContent,
      fileUrl: newPostFileUrl || "",
      fileData: newPostFileData || "",
      linkUrl: newPostLinkUrl || "",
      imageUrl: newPostImageUrl || "",
      videoUrl: newPostVideoUrl || ""
    };

    if (postModalTab === 'edit' && editingPostId) {
      try {
        const res = await fetch(`/api/posts/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const updated: Post = await res.json();
          updatePostsState(posts.map(p => p.id === editingPostId ? updated : p));
          triggerHud("마당 자료가 성공적으로 수정되었습니다.");
        } else {
          throw new Error();
        }
      } catch {
        // Local update fallback
        updatePostsState(posts.map(p => p.id === editingPostId ? {
          ...p,
          ...payload
        } : p));
        triggerHud("자료가 로컬에서 임시 수정되었습니다. (서버 미정지)", "info");
      }
    } else {
      try {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const added: Post = await res.json();
          updatePostsState([added, ...posts]);
          triggerHud("새 마당 자료가 완벽하게 업로드되었습니다.");
        } else {
          throw new Error();
        }
      } catch {
        // Local addition
        const mockPost: Post = {
          id: 'mock_' + Date.now(),
          ...payload,
          date: new Date().toISOString().split('T')[0],
          views: 1
        };
        updatePostsState([mockPost, ...posts]);
        triggerHud("자료가 로컬에 임시 생성되었습니다. (서버 미정지)", "info");
      }
    }

    // Reset
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostAuthor('');
    setNewPostFileUrl('');
    setNewPostFileData('');
    setNewPostLinkUrl('');
    setNewPostImageUrl('');
    setNewPostVideoUrl('');
    setPostModalTab('add');
    setEditingPostId(null);
    setShowAddPostModal(false);
  };

  // Administrative and Role Authentication handlers
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAuthRole === 'student_council') {
      if (authPasscode === 'wongok123') {
        setUserRole('student_council');
        triggerHud("🛡️ 학생 자치 운영단 모드로 성공적으로 전환되었습니다!", "success");
        setAuthPasscode('');
        setShowAuthModal(false);
      } else {
        triggerHud("비밀번호가 올바르지 않습니다. (자치회 힌트: wongok123)", "error");
      }
    } else if (selectedAuthRole === 'admin') {
      if (authPasscode === 'dnjsdnwl5800!@') {
        setUserRole('admin');
        triggerHud("👑 교사 관리자 모드로 성공적으로 전환되었습니다!", "success");
        setAuthPasscode('');
        setShowAuthModal(false);
      } else {
        triggerHud("비밀번호가 올바르지 않습니다. (교사 힌트: dnjsdnwl5800!@)", "error");
      }
    }
  };

  const handleLogoutRole = () => {
    setUserRole('student');
    triggerHud("일반 학생 권한으로 돌아왔습니다.", "info");
    setShowAuthModal(false);
  };

  // Toggle blind/flag for Post (by student_council or admin)
  const handleToggleFlagPost = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const post = posts.find(p => p.id === id);
    if (!post) return;
    const nextFlagged = !post.isFlagged;
    
    if (nextFlagged && !confirm("이 게시물을 부적절한 게시물로 분류하여 일반 학생들에게 블라인드 처리하겠습니까?")) return;
    if (!nextFlagged && !confirm("이 게시물의 블라인드 처리를 해제하고 일반 학생들에게 다시 노출하겠습니까?")) return;

    const payload = {
      isFlagged: nextFlagged,
      flaggedReason: nextFlagged ? '학생자치회/관리자 검토에 의해 블라인드 처리된 게시물입니다.' : ''
    };

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated: Post = await res.json();
        updatePostsState(posts.map(p => p.id === id ? updated : p));
        triggerHud(nextFlagged ? "게시물이 블라인드(가림) 처리되었습니다." : "게시물 블라인드가 해제되었습니다.");
        if (selectedPost?.id === id) {
          setSelectedPost({ ...selectedPost, ...payload });
        }
      } else {
        throw new Error();
      }
    } catch {
      // Local fallback
      updatePostsState(posts.map(p => p.id === id ? { ...p, ...payload } : p));
      triggerHud("로컬 환경에서 임시 처리되었습니다.", "info");
      if (selectedPost?.id === id) {
        setSelectedPost({ ...selectedPost, ...payload });
      }
    }
  };

  // Toggle blind/flag for Gallery Media
  const handleToggleFlagGallery = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = gallery.find(g => g.id === id);
    if (!item) return;
    const nextFlagged = !item.isFlagged;

    if (nextFlagged && !confirm("이 미디어를 부적절한 영상/사진으로 분류하여 일반 학생들에게 블라인드 처리하겠습니까?")) return;
    if (!nextFlagged && !confirm("이 미디어의 블라인드 처리를 해제하고 일반 학생들에게 다시 노출하겠습니까?")) return;

    const payload = {
      isFlagged: nextFlagged,
      flaggedReason: nextFlagged ? '부적절성 검토로 블라인드 처리된 미디어입니다.' : ''
    };

    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated: GalleryItem = await res.json();
        setGallery(gallery.map(g => g.id === id ? updated : g));
        triggerHud(nextFlagged ? "미디어가 블라인드(가림) 처리되었습니다." : "미디어가 정상 노출됩니다.");
      } else {
        throw new Error();
      }
    } catch {
      setGallery(gallery.map(g => g.id === id ? { ...g, ...payload } : g));
      triggerHud("로컬 환경에서 임시 처리되었습니다.", "info");
    }
  };

  // Delete Gallery Media Item (by Admin only)
  const handleDeleteGallery = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 영상/사진 자료를 영구적으로 완전히 삭제하시겠습니까? (되돌릴 수 없습니다)")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGallery(gallery.filter(g => g.id !== id));
        triggerHud("미디어가 성공적으로 삭제되었습니다.");
      } else {
        throw new Error();
      }
    } catch {
      setGallery(gallery.filter(g => g.id !== id));
      triggerHud("미디어를 로컬 목록에서 제거했습니다.", "info");
    }
  };

  const handleDeletePost = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 자료를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        updatePostsState(posts.filter(p => p.id !== id));
        triggerHud("성공적으로 삭제되었습니다.");
        if (selectedPost?.id === id) setSelectedPost(null);
      } else {
        throw new Error();
      }
    } catch {
      updatePostsState(posts.filter(p => p.id !== id));
      triggerHud("자료를 로컬에서 지웠습니다.", "info");
      if (selectedPost?.id === id) setSelectedPost(null);
    }
  };

  const handlePostView = async (post: Post) => {
    setSelectedPost(post);
    try {
      const res = await fetch('/api/posts/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id })
      });
      if (res.ok) {
        const data = await res.json();
        updatePostsState(posts.map(p => p.id === post.id ? { ...p, views: data.views } : p));
      }
    } catch {
      updatePostsState(posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p));
    }
  };

  // Rent item submit
  const handleRentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRentalItem) return;
    if (!renterName || !renterClass) {
      triggerHud("대여자 이름 및 대여목적 학급을 써주세요.", "error");
      return;
    }

    try {
      const res = await fetch('/api/rentals/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeRentalItem.id,
          renter: `${renterClass} ${renterName}`,
          classRoom: "체육 활동 지원"
        })
      });
      if (res.ok) {
        const data = await res.json();
        updateRentalsState(rentals.map(r => r.id === activeRentalItem.id ? data.item : r));
        triggerHud(`[${activeRentalItem.name}] 자재 대여가 승인되었습니다.`);
      } else {
        throw new Error();
      }
    } catch {
      updateRentalsState(rentals.map(r => r.id === activeRentalItem.id ? { 
        ...r, 
        rented: Math.min(r.total, r.rented + 1),
        renter: `${renterClass} ${renterName}`,
        classRoom: "현장 대여"
      } : r));
      triggerHud("로컬에서 대여 승인 완료.", "info");
    }

    setRenterName('');
    setRenterClass('');
    setShowRentalModal(false);
    setActiveRentalItem(null);
  };

  const handleReturnItem = async (id: string) => {
    try {
      const res = await fetch('/api/rentals/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        updateRentalsState(rentals.map(r => r.id === id ? data.item : r));
        triggerHud("해당 스포츠 기자재 반납을 수리했습니다.");
      } else {
        throw new Error();
      }
    } catch {
      const current = rentals.find(r => r.id === id);
      if (current && current.rented > 0) {
        const newRented = current.rented - 1;
        updateRentalsState(rentals.map(r => r.id === id ? { 
          ...r, 
          rented: newRented,
          renter: newRented === 0 ? undefined : r.renter,
          classRoom: newRented === 0 ? undefined : r.classRoom
        } : r));
        triggerHud("기자재 반납 처리를 마크했습니다.", "info");
      }
    }
  };

  // Match operations
  const handleScoreUpdate = async (id: string, team: 'A' | 'B', action: 'inc' | 'dec') => {
    try {
      const res = await fetch('/api/matches/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, team, action })
      });
      if (res.ok) {
        const data = await res.json();
        updateMatchesState(matches.map(m => m.id === id ? data.match : m));
      } else {
        throw new Error();
      }
    } catch {
      updateMatchesState(matches.map(m => {
        if (m.id === id) {
          const delta = action === 'inc' ? 1 : -1;
          return {
            ...m,
            scoreA: team === 'A' ? Math.max(0, m.scoreA + delta) : m.scoreA,
            scoreB: team === 'B' ? Math.max(0, m.scoreB + delta) : m.scoreB,
          };
        }
        return m;
      }));
    }
  };

  const handleStatusUpdate = async (id: string, status: 'scheduled' | 'playing' | 'finished') => {
    try {
      const res = await fetch('/api/matches/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        const data = await res.json();
        updateMatchesState(matches.map(m => m.id === id ? data.match : m));
        triggerHud("경기 운영 상태가 업데이트되었습니다.");
      } else {
        throw new Error();
      }
    } catch {
      updateMatchesState(matches.map(m => {
        if (m.id === id) {
          return {
            ...m,
            status,
            time: status === 'playing' ? 'LIVE 경기중' : status === 'finished' ? '경기 종료' : m.time
          };
        }
        return m;
      }));
      triggerHud("운영 상황 변경완료.", "info");
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatchTeamA || !newMatchTeamB) {
      triggerHud("팀 이름을 모두 입력해주세요.", "error");
      return;
    }

    const payload = {
      sport: newMatchSport,
      teamA: newMatchTeamA,
      teamB: newMatchTeamB,
      time: newMatchTime || "점심시간 자율전"
    };

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const added = await res.json();
        updateMatchesState([...matches, added]);
        triggerHud("새 스포츠 대진 매치가 생성되었습니다.");
      } else {
        throw new Error();
      }
    } catch {
      const mockMatch: Match = {
        id: 'mock_m_' + Date.now(),
        ...payload,
        scoreA: 0,
        scoreB: 0,
        status: 'scheduled'
      };
      updateMatchesState([...matches, mockMatch]);
      triggerHud("신규 대진이 로컬에 편성되었습니다.", "info");
    }

    setNewMatchTeamA('');
    setNewMatchTeamB('');
    setNewMatchTime('');
    setShowAddMatchModal(false);
  };

  // Filter Posts Logic
  const getFilteredPosts = () => {
    let list = posts;
    if (activeTab !== 'home') {
      const koreanCategoryMap: Record<string, string> = {
        class: '자유',
        club: '스포츠클럽',
        festival: '학생체육지원단',
        oasis: '내가 바로 원곡 릴스꾼',
        referee: '학생심판지원단(기자단)'
      };
      const koreanCat = koreanCategoryMap[activeTab];
      if (koreanCat) {
        list = list.filter(p => p.category === koreanCat);
      }
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.content.toLowerCase().includes(query) ||
        p.author.toLowerCase().includes(query)
      );
    }
    return list;
  };

  return (
    <div id="wongok-sports-app-root" className="min-h-screen bg-neutral-50 text-neutral-800 flex flex-col font-sans transition-all selection:bg-rose-500 selection:text-white">
      
      {/* HUD Message */}
      {hudMessage && (
        <div 
          id="hud-toast-banner" 
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-full shadow-xl text-sm font-semibold border transition-all duration-300 animate-bounce ${
            hudMessage.type === 'success' ? 'bg-emerald-800 text-white border-emerald-700' :
            hudMessage.type === 'error' ? 'bg-rose-600 text-white border-rose-500' :
            'bg-amber-100 text-amber-950 border-amber-300'
          }`}
        >
          {hudMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{hudMessage.text}</span>
        </div>
      )}


      {/* Sticky Main Header */}
      <header id="main-navigation-header" className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & School Slogan Title */}
          <div 
            id="brand-logo-section" 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('home')}
          >
            <WongokLogo className="w-12 h-12 md:w-14 md:h-14" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-900 font-extrabold text-base md:text-lg tracking-tight leading-none">원곡중학교</span>
                <span className="text-rose-600 font-black text-xs px-1 border border-rose-500 rounded">원더풀</span>
              </div>
              <h1 className="text-neutral-500 text-[10px] md:text-xs font-semibold tracking-wider uppercase mt-1">WON THE FULL Sports Platform</h1>
            </div>
          </div>

          {/* Center Nav tabs */}
          <nav id="desktop-major-nav" className="hidden lg:flex items-center gap-1.5">
            {[
              { id: 'home', label: '종합 마당', icon: Sparkles },
              { id: 'class', label: '자유', icon: BookOpen },
              { id: 'club', label: '스포츠클럽', icon: Trophy },
              { id: 'festival', label: '체육대회', icon: Flame },
              { id: 'oasis', label: '내가 바로 원곡 릴스꾼', icon: Zap },
              { id: 'referee', label: '학생심판지원단(기자단)', icon: Shield }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-btn-${tab.id}`}
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setSelectedPost(null); }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-semibold tracking-tight transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/10 scale-[1.03]' 
                      : 'text-neutral-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-neutral-400 group-hover:text-emerald-700'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Upload button and Admin Auth button */}
          <div className="flex items-center gap-2">
            {/* 권한 인증/설정 배지 */}
            <button
              id="header-role-auth-btn"
              onClick={() => setShowAuthModal(true)}
              className={`px-2.5 md:px-4 py-2 rounded-lg text-xs md:text-sm font-extrabold shadow-sm flex items-center gap-1.5 transition-all active:scale-95 border ${
                userRole === 'student_council'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : userRole === 'admin'
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
              }`}
            >
              {userRole === 'student_council' ? (
                <>
                  <Shield className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  <span className="hidden sm:inline">🛡️ 학생 자치단</span>
                  <span className="sm:hidden">🛡️ 자치단</span>
                </>
              ) : userRole === 'admin' ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="hidden sm:inline">👑 교사 관리자</span>
                  <span className="sm:hidden">👑 관리자</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="hidden sm:inline">🔑 운영진 인증</span>
                  <span className="sm:hidden">🔑 인증</span>
                </>
              )}
            </button>

            <button
              id="header-quick-upload-btn"
              onClick={() => {
                const reverseMap: Record<string, string> = {
                  class: '자유', club: '스포츠클럽', festival: '학생체육지원단',
                  oasis: '내가 바로 원곡 릴스꾼', referee: '학생심판지원단(기자단)'
                };
                setNewPostCategory(reverseMap[activeTab] || '자유');
                setShowAddPostModal(true);
              }}
              className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-extrabold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">소식/자료 등록</span>
              <span className="sm:hidden">쓰기</span>
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Subnavigation */}
        <div id="mobile-subnav-panel" className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-neutral-100 scrollbar-none bg-neutral-50/70">
          {[
            { id: 'home', label: '홈' },
            { id: 'class', label: '자유' },
            { id: 'club', label: '스포츠클럽' },
            { id: 'festival', label: '체육대회' },
            { id: 'oasis', label: '내가 바로 원곡 릴스꾼' },
            { id: 'referee', label: '학생심판(기자단)' }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`mob-nav-tab-${tab.id}`}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setSelectedPost(null); }}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-rose-500 text-white shadow-sm' 
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Hero Banner Section */}
      <section id="homepage-jumbotron-hero" className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white py-12 md:py-20 px-4 overflow-hidden shadow-inner">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="text-center md:text-left md:max-w-4xl transform transition-transform">
            <div className="inline-flex items-center gap-2 bg-emerald-850 border border-emerald-700/60 text-amber-400 px-3 py-1.5 rounded-full text-xs font-extrabold tracking-wide mb-5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>원곡중학교 원더풀 스포츠 & 학생 주도 플랫폼</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4 drop-shadow">
              스포츠 <span className="text-amber-400">원더풀!</span><br className="sm:hidden" /> 너의 열정을 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-500">WON THE FULL</span>로 깨워라!
            </h2>
            
            <p className="text-emerald-100 text-sm md:text-base font-medium leading-relaxed max-w-xl">
              스스로 한계를 깨뜨리고 함께 성장하는 주인공이 되어라! 원곡의 리더십을 발휘하여 뜨거운 도전과 혁신의 전율을 지금 이곳에서 함께 나누고 채워가세요.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-4xl">
              <div className="bg-white/10 border border-white/10 backdrop-blur-md px-4 py-3.5 rounded-2xl flex items-center gap-3.5 shadow hover:bg-white/15 transition-all group duration-200">
                <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] text-amber-300 font-extrabold tracking-wider leading-none mb-1">ACTIVE LEAGUE</div>
                  <div className="text-[12px] font-black text-white leading-tight">열정의 아침&주말 리그전</div>
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md px-4 py-3.5 rounded-2xl flex items-center gap-3.5 shadow hover:bg-white/15 transition-all group duration-200">
                <div className="p-2.5 rounded-xl bg-rose-400/20 text-rose-300 group-hover:scale-110 transition-transform">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] text-rose-300 font-extrabold tracking-wider leading-none mb-1">FAIR PLAY & RESPECT</div>
                  <div className="text-[12px] font-black text-white leading-tight">정정당당 존중 페어플레이</div>
                </div>
              </div>

              <div className="bg-white/10 border border-white/10 backdrop-blur-md px-4 py-3.5 rounded-2xl flex items-center gap-3.5 shadow hover:bg-white/15 transition-all group duration-200">
                <div className="p-2.5 rounded-xl bg-sky-400/20 text-sky-300 group-hover:scale-110 transition-transform">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] text-sky-300 font-extrabold tracking-wider leading-none mb-1">STUDENT LEADERSHIP</div>
                  <div className="text-[12px] font-black text-white leading-tight">주도적인 학생지원단</div>
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-center relative bg-white/5 p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 to-rose-500 rounded-3xl opacity-20 blur pointer-events-none"></div>
            <WongokLogo className="w-48 h-48 md:w-60 md:h-60" />
          </div>
        </div>
      </section>

      {/* Main Content Pane */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        
        {/* ================= tab: HOME (대시보드 종합 마당) ================= */}
        {activeTab === 'home' && (
          <div id="home-dashboard-layout" className="space-y-10 animate-fade-in">

            {/* WON-the FULL Project Concept Card */}
            <div id="wonthefull-concept-card" className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12"></div>
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-800 text-emerald-100 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      PROJECT CONCEPT
                    </span>
                    <span className="text-rose-600 font-extrabold text-xs px-1.5 py-0.5 border border-rose-400 rounded">WON-the FULL</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black text-emerald-950 flex flex-wrap items-baseline gap-2">
                    원더풀 프로젝트 <span className="text-sm md:text-base font-semibold text-neutral-500">(WON–the FULL)</span>
                  </h3>
                  
                  <p className="text-emerald-800/80 text-sm font-medium">
                    ✨ 원곡의 <span className="font-bold text-emerald-900">원(WON)</span>, <span className="font-bold text-rose-600">the FULL</span> = <span className="italic font-bold text-emerald-950">원곡을 가득 채우다</span>
                  </p>
                </div>
              </div>

              {/* F.U.L.L. Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {[
                  {
                    letter: 'F',
                    word: 'Freedom',
                    title: '자유',
                    desc: '시공간의 제약에 대한 자유',
                    detail: '아침 오아시스, 방과후 프로그램, 주말리그전 포괄',
                    color: 'text-amber-500 bg-amber-50 border-amber-100'
                  },
                  {
                    letter: 'U',
                    word: 'Understanding',
                    title: '상호이해',
                    desc: '상생과 통합',
                    detail: '스포츠클럽간의 교류 화합',
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  },
                  {
                    letter: 'L',
                    word: 'Leadership',
                    title: '리더십',
                    desc: '스포츠 자치 문화 실현',
                    detail: '학생 심판, 학생 체육지원단 주체화',
                    color: 'text-rose-500 bg-rose-50 border-rose-100'
                  },
                  {
                    letter: 'L',
                    word: 'Learner-centered',
                    title: '학습자 중심',
                    desc: '교육과정 운영',
                    detail: '선택 중심의 자기주도 체육 교육과정',
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white border border-neutral-200/60 hover:border-emerald-500/30 rounded-2xl p-4.5 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-8 h-8 rounded-xl font-black text-[15px] flex items-center justify-center ${item.color}`}>
                        {item.letter}
                      </span>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase block -mb-0.5">{item.word}</span>
                        <span className="font-black text-neutral-800 text-sm">{item.title}</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-neutral-700 leading-snug">{item.desc}</p>
                    <p className="text-[11px] font-medium text-neutral-400 mt-1 leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Dimension Grid Links */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
                <h3 className="text-emerald-950 font-black text-xl flex items-center gap-2">
                  <span className="w-2.5 h-5 bg-emerald-800 rounded"></span>원더풀 학례 영역별 세부 바로가기
                </h3>
                <p className="text-xs text-neutral-500 font-medium font-sans">
                  각 핵심 영역 아이콘을 클릭하여 해당 공유방으로 바로 이동할 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    id: 'class', 
                    label: '자유', 
                    desc: '', 
                    icon: BookOpen, 
                    badge: 'F (Freedom)',
                    accentClass: 'border-amber-200 bg-amber-50/30 text-amber-900 hover:border-amber-400',
                    badgeColors: 'bg-amber-100 text-amber-800 border-amber-200',
                    features: [
                      '자율적인 아침 체육 활동',
                      '주도적인 방과후 스포츠클럽',
                      '함께 즐기는 주말 리그전'
                    ]
                  },
                  {
                    id: 'club', 
                    label: '스포츠클럽 소식지', 
                    desc: '', 
                    icon: Trophy, 
                    badge: 'U (Understanding)',
                    accentClass: 'border-emerald-200 bg-emerald-50/30 text-emerald-900 hover:border-emerald-400',
                    badgeColors: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    features: [
                      '상호 배려와 포용의 스포츠 대회',
                      '존중을 바탕으로 한 친선 경기',
                      '협동과 신뢰의 화합 리그전'
                    ]
                  },
                  {
                    id: 'festival', 
                    label: '학생체육지원단', 
                    desc: '', 
                    icon: Flame, 
                    badge: 'L (Leadership)',
                    accentClass: 'border-rose-200 bg-rose-50/30 text-rose-900 hover:border-rose-400',
                    badgeColors: 'bg-rose-100 text-rose-800 border-rose-200',
                    features: [
                      '리더십을 발휘하는 학년 교류',
                      '공동 목표를 위한 주체적 분담',
                      '공정함과 격려의 체육대회'
                    ]
                  },
                  {
                    id: 'oasis', 
                    label: '내가 바로 원곡 릴스꾼', 
                    desc: '', 
                    icon: Zap, 
                    badge: 'L (Learner-centered)',
                    accentClass: 'border-indigo-200 bg-indigo-50/30 text-indigo-900 hover:border-indigo-400',
                    badgeColors: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                    features: [
                      '학습자 중심의 자발적 체육 릴스',
                      '스스로 제작·공유하는 숏폼',
                      '개성과 흥미 중심의 활기찬 배움'
                    ]
                  },
                  {
                    id: 'referee', 
                    label: '학생심판지원단(기자단)', 
                    desc: '', 
                    icon: Shield, 
                    badge: 'L (Leadership)',
                    accentClass: 'border-rose-200 bg-rose-50/30 text-rose-900 hover:border-rose-400',
                    badgeColors: 'bg-rose-100 text-rose-800 border-rose-200',
                    features: [
                      '학생 심판 지원단',
                      '학생 기자단',
                      '학생 심판 매뉴얼 목록'
                    ]
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      id={`home-shortcut-card-${item.id}`}
                      onClick={() => setActiveTab(item.id)}
                      className={`group border rounded-2xl p-5 cursor-pointer bg-white transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${item.accentClass}`}
                    >
                      <div>
                        {/* Header of the card */}
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-neutral-150 shadow-sm group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5 text-emerald-900" />
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${item.badgeColors}`}>
                            {item.badge}
                          </span>
                        </div>

                        {/* Title & subtitle */}
                        <h4 className="font-extrabold text-neutral-800 text-base mb-1 group-hover:text-emerald-900 transition-colors">
                          {item.label}
                        </h4>
                        {item.desc && (
                          <p className="text-xs text-neutral-500 font-medium leading-relaxed mb-4">
                            {item.desc}
                          </p>
                        )}

                        {/* Sub feature list */}
                        {item.features && item.features.length > 0 && (
                          <div className="space-y-1.5 border-t border-neutral-100 pt-3.5 mb-5 select-none text-left">
                            <span className="block text-[10px] text-neutral-400 font-bold tracking-wider mb-2 uppercase">주요 세부 제공 내용 수록</span>
                            {item.features.map((feature, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-1.5 text-[11px] md:text-xs text-neutral-600 font-semibold">
                                <span className="text-emerald-800 mt-[3px] shrink-0">✓</span>
                                <span className="leading-snug">{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Click target helper */}
                      <div className="flex items-center justify-between mt-auto pt-2 text-[11px] font-bold text-emerald-900 group-hover:underline">
                        <span>세부자료실 입장하기</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick overview of latest Reels */}
            <div className="bg-neutral-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase mb-3 inline-block">
                    🔥 실시간 인기 코너
                  </span>
                  <h3 className="text-xl md:text-2xl font-black mb-2">내가 바로 원곡 릴스꾼! 지금 바로 참여해봐!</h3>
                  <p className="text-neutral-400 text-xs md:text-sm max-w-lg mb-4">
                    체육시간 열정 가득한 릴스, 개성 넘치는 세로 숏폼 영상, 스포츠클럽 골장면 하이라이트를 올리고 소통하세요!
                  </p>
                  <button 
                    onClick={() => {
                      setActiveTab('oasis');
                      setSearchQuery('');
                      setSelectedPost(null);
                    }}
                    className="bg-rose-500 hover:bg-rose-600 border border-rose-500 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-extrabold flex items-center gap-1.5 transition-all shadow shadow-rose-900"
                  >
                    릴스 마당 참가하기 <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 p-1.5 bg-neutral-800 rounded-2xl border border-neutral-700/60 max-w-[280px]">
                  <div className="w-24 h-24 bg-rose-950/20 rounded-xl border border-rose-500 flex flex-col items-center justify-center text-center p-2">
                    <Play className="w-6 h-6 text-rose-500 animate-pulse fill-rose-500" />
                    <span className="text-[9px] mt-1 font-bold text-rose-400">숏폼 촬영방</span>
                  </div>
                  <div className="w-24 h-24 bg-amber-950/20 rounded-xl border border-amber-500 flex flex-col items-center justify-center text-center p-2">
                    <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                    <span className="text-[9px] mt-1 font-bold text-amber-400">인기 릴스꾼</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ================= tab: MULTI CATEGORY CONTENT LIST ================= */}
        {activeTab !== 'home' && (
          <div id="posts-sharing-board-tab" className="space-y-6 animate-fade-in">
            
            {/* Topic Navigation Board Info Box */}
            <div className="bg-white border text-emerald-900 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-150 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-neutral-800">
                    {activeTab === 'class' && '자유 자료 공유실'}
                    {activeTab === 'club' && '스포츠클럽 소식지 마당'}
                    {activeTab === 'festival' && '학생체육지원단'}
                    {activeTab === 'oasis' && '내가 바로 원곡 릴스꾼 마당'}
                    {activeTab === 'referee' && '학생심판지원단(기자단) 정보실'}
                  </h3>

                </div>
              </div>
              
              <button
                onClick={() => {
                  const reverseMap: Record<string, string> = {
                    class: '자유', club: '스포츠클럽', festival: '학생체육지원단',
                    oasis: '내가 바로 원곡 릴스꾼', referee: '학생심판지원단(기자단)'
                  };
                  setNewPostCategory(reverseMap[activeTab] || '자유');
                  setShowAddPostModal(true);
                }}
                className={`font-black text-xs px-4.5 py-3.5 rounded-xl flex items-center gap-1.5 shrink-0 shadow transition-all duration-200 active:scale-95 ${
                  activeTab === 'oasis'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200/50 hover:shadow-rose-300'
                    : 'bg-emerald-950 hover:bg-emerald-900 text-white shadow-emerald-950/20'
                }`}
              >
                {activeTab === 'oasis' ? (
                  <>
                    <Play className="w-4 h-4 text-white fill-white animate-pulse" />
                    나도 원곡 릴스꾼 도전! 영상·사진 올리기
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    자료 게시판 글쓰기
                  </>
                )}
              </button>
            </div>

            {/* 학생 심판 매뉴얼 목록 - ONLY shown on 'referee' Tab */}
            {activeTab === 'referee' && (
              <div id="student-referee-manual-section" className="bg-gradient-to-br from-neutral-50 to-rose-50/20 border border-neutral-200 rounded-3xl p-6 shadow-sm animate-fade-in space-y-6">
                <div className="pb-4 border-b border-neutral-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-rose-500 text-white rounded-xl shadow-sm shadow-rose-200">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-neutral-800 text-base flex items-center gap-1.5">
                        ⚖️ 우리가 직접 만들어가는 원곡 자치 스포츠 약속 & 매뉴얼
                        <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-black border border-rose-100 animate-pulse">OUR OWN RULES</span>
                      </h4>
                      <p className="text-xs text-neutral-500 font-medium mt-0.5">원곡중학교 학생들이 의견을 모아 스스로 정립하고 엄격하게 지켜내는 학생 주도형 스포츠 자치 규약입니다.</p>
                    </div>
                  </div>
                </div>



                {/* Bottom Tip Banner */}
                <div className="bg-neutral-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">📢</span>
                    <div>
                      <h5 className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-widest leading-none mb-1">OUR CORE VALUE</h5>
                      <p className="text-xs text-neutral-200 font-semibold">"우리가 스스로 세워둔 규칙이 있을 때, 원곡중 체육 광장은 단순한 경기장을 넘어 진정한 스포츠 민주주의 배움터가 됩니다!"</p>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 font-bold sm:text-right shrink-0">
                    원곡중학교 자치체육회 & 학생심판지원단 공동 선포
                  </div>
                </div>
              </div>
            )}

            {/* Custom Search panel inside category lists */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  id="posts-search-input"
                  type="text"
                  placeholder="제목, 내용, 학번·이름 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 bg-white border border-neutral-300 rounded-xl text-xs md:text-sm focus:outline-none focus:border-emerald-800 transition-all font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="text-xs text-neutral-400 font-semibold self-end sm:self-center">
                검색된 소식지 수: <span className="text-emerald-900 font-black">{getFilteredPosts().length}</span>개
              </div>
            </div>

            {/* Posts Cards Grid */}
            {getFilteredPosts().length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-2xl py-20 text-center">
                <Search className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500 font-extrabold text-base">조회되는 소식이 기획되어 있지 않습니다.</p>
                <p className="text-neutral-400 text-xs mt-1">우측 상단 글쓰기 버튼을 눌러 첫 소식을 공유해 보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredPosts().map((post) => (
                  <div
                    key={post.id}
                    id={`post-list-item-${post.id}`}
                    onClick={() => {
                      // If post is flagged and role is standard student, do not allow reading details
                      if (post.isFlagged && userRole === 'student') {
                        triggerHud("학생 자치 운영위원회의 권고로 인해 블라인드 처리된 자료입니다.", "error");
                        return;
                      }
                      handlePostView(post);
                    }}
                    className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                      post.isFlagged
                        ? 'border-amber-300 bg-amber-50/10'
                        : 'border-neutral-200/80'
                    }`}
                  >
                    <div>
                      {/* Flagged Banner Indicator for Admins / Student Council */}
                      {post.isFlagged && (
                        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2 -mx-5 -mt-5 mb-4 flex items-center gap-1.5 text-amber-800 text-[10px] font-black">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>⚠️ 학생자치회 블라인드 규제 적용 중</span>
                        </div>
                      )}

                      {/* Media Card Thumbnail Preview if exists */}
                      {(post.imageUrl || post.videoUrl) && !(post.isFlagged && userRole === 'student') && (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 mb-3.5 border border-neutral-100 flex items-center justify-center shrink-0">
                          {post.videoUrl ? (
                            <div className="w-full h-full relative">
                              <video src={post.videoUrl} className="w-full h-full object-cover pointer-events-none" muted />
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                <Play className="w-9 h-9 text-white fill-white/80 drop-shadow animate-pulse" />
                              </div>
                              <span className="absolute bottom-2 right-2 bg-neutral-950/80 backdrop-blur px-2.5 py-0.5 rounded text-[9px] font-black text-rose-400 flex items-center gap-1">
                                <Zap className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                                원곡 릴스꾼 비디오
                              </span>
                            </div>
                          ) : post.imageUrl ? (
                            <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" referrerPolicy="no-referrer" />
                          ) : null}
                        </div>
                      )}

                      {/* Post top decorations */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-rose-500 tracking-wider bg-rose-50 px-2.5 py-1 rounded">
                            {post.category}
                          </span>
                          {post.imageUrl && !(post.isFlagged && userRole === 'student') && (
                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded leading-none shrink-0">
                              📸 사진
                            </span>
                          )}
                          {post.videoUrl && !(post.isFlagged && userRole === 'student') && (
                            <span className="text-[9px] font-black text-sky-700 bg-sky-50 border border-sky-100 px-1.5 py-0.5 rounded leading-none shrink-0">
                              🎬 영상
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2.5 text-[11px] text-neutral-400">
                          <span className="flex items-center gap-1 capitalize font-medium">
                            <User className="w-3 h-3" /> {post.author}
                          </span>
                        </div>
                      </div>

                      {post.isFlagged && userRole === 'student' ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 bg-amber-50/40 rounded-2xl border border-dashed border-amber-300 min-h-[140px] my-2">
                          <AlertCircle className="w-8 h-8 text-amber-600 mb-2 animate-bounce" />
                          <p className="text-xs font-black text-amber-950 leading-normal">
                            부적절성 우려로 블라인드 처리됨
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-1.5 font-medium leading-relaxed max-w-[200px]">
                            원곡중 자치 규정에 어긋나거나 부적절한 표현이 식별되어 학생 자치단에서 임시로 노출을 제한하였습니다.
                          </p>
                        </div>
                      ) : (
                        <div className={post.isFlagged ? 'opacity-70' : ''}>
                          <h4 className="font-extrabold text-neutral-800 text-base md:text-lg mb-2 leading-snug group-hover:text-emerald-800 transition-colors line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-neutral-500 text-xs leading-relaxed mb-4 line-clamp-3">
                            {post.content}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-auto border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {post.date}
                      </span>
                      
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" /> {post.views}
                        </span>
                        
                        {(post.fileUrl || post.linkUrl) && !(post.isFlagged && userRole === 'student') && (
                          <span className="bg-emerald-50 text-emerald-800 p-1 rounded">
                            <FileDown className="w-3.5 h-3.5" />
                          </span>
                        )}
                        
                        {/* 학생 자치 자율 정화 블라인드 단추 */}
                        {(userRole === 'student_council' || userRole === 'admin') && (
                          <button 
                            onClick={(e) => handleToggleFlagPost(post.id, e)}
                            className={`p-1.5 rounded-lg border transition-colors flex items-center justify-center ${
                              post.isFlagged 
                                ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600' 
                                : 'text-neutral-400 border-neutral-200 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50'
                            }`}
                            title={post.isFlagged ? "블라인드 처리 해제" : "부적절 보고 및 블라인드 처리"}
                          >
                            <Shield className={`w-3.5 h-3.5 ${post.isFlagged ? 'fill-white' : ''}`} />
                          </button>
                        )}

                        {/* 교사 최고 관리자 완전 삭제 단추 */}
                        {userRole === 'admin' && (
                          <button 
                            onClick={(e) => handleDeletePost(post.id, e)}
                            className="text-neutral-400 hover:text-rose-600 border border-neutral-200 hover:bg-rose-50 hover:border-rose-200 p-1.5 rounded-lg transition-colors flex items-center justify-center"
                            title="이 자료 영구 영토 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
          </div>
        )}

      </main>

      {/* ================= MODAL: READ POST DIALOG ================= */}
      {selectedPost && (
        <div 
          id="post-reader-modal" 
          className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header color bar */}
            <div className="h-2.5 bg-emerald-900 w-full" />
            
            {/* Scrollable container */}
            <div className="p-6 md:p-8 overflow-y-auto">
              {/* Close Button */}
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-6 right-6 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-rose-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  {selectedPost.category}
                </span>
                <span className="text-[11px] text-neutral-400 font-bold flex items-center gap-0.5">
                  <Calendar className="w-3 h-3" /> {selectedPost.date}
                </span>
              </div>

              <h3 className="font-black text-xl md:text-2xl text-neutral-900 leading-tight mb-4 select-text">
                {selectedPost.title}
              </h3>

              <div className="flex items-center gap-2 mb-6 p-3 bg-neutral-50 rounded-2xl text-xs text-neutral-500">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  {selectedPost.author.slice(0, 2)}
                </div>
                <div>
                  <span className="font-extrabold text-neutral-800 block text-sm tracking-tight">{selectedPost.author}</span>
                  <span className="text-[10px] text-neutral-400">원곡중 체육교육 소통 마당 위원</span>
                </div>
                <div className="ml-auto text-neutral-400 pr-2">
                  조회수 <span className="font-bold text-neutral-700">{selectedPost.views}</span>
                </div>
              </div>

              {selectedPost.imageUrl && (
                <div id={`post-image-preview-${selectedPost.id}`} className="mb-6 rounded-2xl overflow-hidden border border-neutral-100 max-h-[380px] flex items-center justify-center bg-neutral-50 shadow-sm">
                  <img 
                    src={selectedPost.imageUrl} 
                    alt={selectedPost.title} 
                    className="max-h-[380px] object-contain w-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {selectedPost.videoUrl && (
                <div id={`post-video-player-${selectedPost.id}`} className="mb-6 rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 aspect-video max-h-[380px] w-full flex items-center justify-center shadow-lg relative animate-fade-in">
                  <video 
                    src={selectedPost.videoUrl} 
                    controls 
                    className="w-full h-full object-contain" 
                  />
                  <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] font-bold text-white flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                    동영상 첨부됨
                  </div>
                </div>
              )}

              <div className="prose max-w-none text-neutral-700 text-sm md:text-base leading-relaxed whitespace-pre-line select-text mb-8">
                {selectedPost.content}
              </div>

              {/* Attachments Section if they exist */}
              {(selectedPost.fileUrl || selectedPost.linkUrl) && (
                <div className="border-t border-neutral-100 pt-6 space-y-3">
                  <h5 className="font-extrabold text-xs text-neutral-400 tracking-wide uppercase">첨부파일 및 수식 연치</h5>
                  <div className="flex flex-col gap-2">
                    {selectedPost.fileUrl && (
                      <a 
                        href={selectedPost.fileData || '#'} 
                        download={selectedPost.fileUrl}
                        onClick={(e) => {
                          if (!selectedPost.fileData) {
                            e.preventDefault(); 
                            alert("선택하신 자재/문서를 컴퓨터에 안전하게 내려받는 중입니다. (시뮬레이션)");
                          } else {
                            triggerHud(`"${selectedPost.fileUrl}" 파일을 기기에 안전하게 저장하였습니다.`);
                          }
                        }}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-950 px-4 py-3 rounded-xl text-xs md:text-sm font-extrabold flex items-center justify-between border border-emerald-100 transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <FileDown className="w-4.5 h-4.5 text-emerald-700 shrink-0" />
                          <span className="truncate">{selectedPost.fileUrl}</span>
                        </span>
                        <span className="text-[10px] bg-emerald-900 text-white px-2 py-0.5 rounded font-black">DOWNLOAD</span>
                      </a>
                    )}
                    {selectedPost.linkUrl && (
                      <a 
                        href={selectedPost.linkUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-neutral-50 hover:bg-neutral-100 text-neutral-800 px-4 py-3 rounded-xl text-xs md:text-sm font-extrabold flex items-center justify-between border transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Play className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                          <span className="truncate text-blue-600 underline">{selectedPost.linkUrl}</span>
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Actions banner */}
            <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                {/* 자치단/관리자용 블라인드 제어 */}
                {(userRole === 'student_council' || userRole === 'admin') && (
                  <button
                    onClick={(e) => {
                      handleToggleFlagPost(selectedPost.id, e);
                    }}
                    className={`flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-lg border transition-colors ${
                      selectedPost.isFlagged
                        ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:text-amber-500 hover:border-amber-200 hover:bg-amber-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>{selectedPost.isFlagged ? '블라인드 해제' : '부적절 가림 적용'}</span>
                  </button>
                )}

                {/* 관리자전용 영구 삭제 제어 */}
                {userRole === 'admin' && (
                  <button
                    onClick={(e) => {
                      handleDeletePost(selectedPost.id, e);
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>완전 삭제</span>
                  </button>
                )}
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD POST FORM ================= */}
      {showAddPostModal && (
        <div 
          id="add-post-wizard-modal" 
          className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAddPostModal(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className={`h-2 transition-colors duration-300 ${postModalTab === 'edit' ? 'bg-amber-500' : 'bg-emerald-900'}`} />
            <form onSubmit={handleCreatePost} className="p-6 md:p-8 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-black text-xl text-neutral-900">
                  {postModalTab === 'edit' ? '원곡중 소식/자료 수정마당' : '새 자료 및 소식 발행'}
                </h3>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowAddPostModal(false);
                    setPostModalTab('add');
                    setEditingPostId(null);
                  }}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab navigation inside registration modal */}
              <div className="flex border-b border-neutral-100 pb-2 mb-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPostModalTab('add');
                    setEditingPostId(null);
                    setNewPostTitle('');
                    setNewPostContent('');
                    setNewPostAuthor('');
                    setNewPostFileUrl('');
                    setNewPostFileData('');
                    setNewPostLinkUrl('');
                    setNewPostImageUrl('');
                    setNewPostVideoUrl('');
                  }}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl border transition-all ${
                    postModalTab === 'add'
                      ? 'bg-emerald-900 border-emerald-900 text-white shadow-sm'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  ➕ 새 소식/자료 발행
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPostModalTab('edit');
                    setEditingPostId(null);
                    setNewPostTitle('');
                    setNewPostContent('');
                    setNewPostAuthor('');
                    setNewPostFileUrl('');
                    setNewPostFileData('');
                    setNewPostLinkUrl('');
                    setNewPostImageUrl('');
                    setNewPostVideoUrl('');
                  }}
                  className={`flex-1 py-2 text-center text-xs font-black rounded-xl border transition-all ${
                    postModalTab === 'edit'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                  }`}
                >
                  ✏️ 기존 자료 수정하기
                </button>
              </div>

              {postModalTab === 'edit' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4.5 mb-2 animate-fade-in space-y-3">
                  <label className="block text-xs font-black text-amber-800 uppercase tracking-wider">
                    ✏️ 수정할 소식/자료 선택하기
                  </label>
                  <select
                    id="edit-post-selector"
                    value={editingPostId || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const postToEdit = posts.find(p => p.id === val);
                        if (postToEdit) {
                          setEditingPostId(postToEdit.id);
                          setNewPostCategory(postToEdit.category);
                          setNewPostTitle(postToEdit.title);
                          setNewPostAuthor(postToEdit.author);
                          setNewPostContent(postToEdit.content);
                          setNewPostFileUrl(postToEdit.fileUrl || '');
                          setNewPostFileData(postToEdit.fileData || '');
                          setNewPostLinkUrl(postToEdit.linkUrl || '');
                          setNewPostImageUrl(postToEdit.imageUrl || '');
                          setNewPostVideoUrl(postToEdit.videoUrl || '');
                          triggerHud(`"${postToEdit.title.slice(0, 15)}..." 자료 데이터를 성공적으로 불러왔습니다.`, "info");
                        }
                      } else {
                        setEditingPostId(null);
                        setNewPostTitle('');
                        setNewPostContent('');
                        setNewPostAuthor('');
                        setNewPostFileUrl('');
                        setNewPostFileData('');
                        setNewPostLinkUrl('');
                        setNewPostImageUrl('');
                        setNewPostVideoUrl('');
                      }
                    }}
                    className="w-full border border-amber-200 rounded-xl px-3 py-2.5 bg-white text-neutral-800 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                  >
                    <option value="">-- 수정할 자료를 목록에서 선택해주세요 --</option>
                    {posts.map(post => (
                      <option key={post.id} value={post.id}>
                        [{post.category}] {post.title.length > 30 ? post.title.slice(0, 30) + '...' : post.title} ({post.author})
                      </option>
                    ))}
                  </select>
                  {editingPostId && (
                    <div className="text-[11px] text-amber-700 font-bold flex items-center justify-between">
                      <span>선택됨: ID {editingPostId}</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingPostId(null);
                          setNewPostTitle('');
                          setNewPostContent('');
                          setNewPostAuthor('');
                          setNewPostFileUrl('');
                          setNewPostFileData('');
                          setNewPostLinkUrl('');
                          setNewPostImageUrl('');
                          setNewPostVideoUrl('');
                        }}
                        className="text-rose-500 hover:underline hover:text-rose-600 font-extrabold"
                      >
                        선택 취소 및 초기화
                      </button>
                    </div>
                  )}
                </div>
              )}

              {postModalTab === 'edit' && !editingPostId && (
                <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-6 text-center text-xs text-neutral-500 font-semibold space-y-1 py-10 animate-fade-in">
                  <p className="text-sm font-bold text-neutral-700">✏️ 수정 대상 미선택</p>
                  <p className="text-[11px] text-neutral-400">위 목록에서 수정할 원곡중 소식 또는 자료를 먼저 선택하시면 수정 양식이 채워집니다.</p>
                </div>
              )}

              {/* Only show form content if we are in 'add' tab or (in 'edit' tab and editingPostId is selected) */}
              {(postModalTab === 'add' || (postModalTab === 'edit' && editingPostId)) && (
                <div className="space-y-4 animate-fade-in">

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">카테고리</label>
                <select
                  id="form-post-category"
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 bg-white text-neutral-800 focus:outline-none focus:border-emerald-800 text-sm font-semibold"
                >
                  {['자유', '스포츠클럽', '학생체육지원단', '내가 바로 원곡 릴스꾼', '학생심판지원단(기자단)'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {newPostCategory === '내가 바로 원곡 릴스꾼' && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs text-rose-950 space-y-1.5 animate-fade-in">
                  <p className="font-extrabold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                    🔥 원곡중 릴스왕 비디오 꿀팁!
                  </p>
                  <p className="text-[11px] leading-relaxed text-rose-900/90 font-medium">
                    직접 찍은 세로형 숏폼 영상 주소(MP4 파일 주소)나 멋지게 운동하는 현장 사진을 업로드해 보세요! 다른 학생들이 직접 터치해 플레이하고 소통할 수 있는 릴스가 발행됩니다.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">학번, 이름</label>
                <input
                  id="form-post-author"
                  type="text"
                  required
                  placeholder="학번 및 이름 (예: 30123 홍길동)"
                  value={newPostAuthor}
                  onChange={(e) => setNewPostAuthor(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:border-emerald-800 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">자료 제목</label>
                <input
                  id="form-post-title"
                  type="text"
                  required
                  placeholder="학생들에게 배포할 명확한 제목을 적어주세요"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:border-emerald-800 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">상세 배포 내용</label>
                <textarea
                  id="form-post-content"
                  rows={4}
                  required
                  placeholder="전달하고픈 공부방법이나 스포츠 규칙, 일정 등을 상세 기입해 주세요"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:border-emerald-800 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>사진 / 대표 스냅사진 등록 (선택)</span>
                  {newPostImageUrl && (
                    <button 
                      type="button" 
                      onClick={() => setNewPostImageUrl('')}
                      className="text-[10px] text-rose-500 font-extrabold hover:underline"
                    >
                      삭제
                    </button>
                  )}
                </label>
                {newPostImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border max-h-[140px] flex items-center justify-center bg-neutral-50 p-1">
                    <img src={newPostImageUrl} alt="미리보기" className="max-h-[130px] object-contain rounded-lg" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="border border-dashed border-emerald-300 rounded-xl p-3 bg-emerald-50/20 text-center relative hover:bg-emerald-50 transition-colors flex flex-col justify-center items-center">
                      <input 
                        type="file" 
                        accept="image/*" 
                        ref={postImageFileInputRef}
                        onChange={handlePostImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="w-4 h-4 text-emerald-800 mb-1" />
                      <span className="block font-black text-[10px] text-neutral-800">기기 내 사진 파일 선택</span>
                    </div>
                    <div>
                      <input 
                        type="text"
                        placeholder="또는 이미지 웹 주소(URL) 입력"
                        value={newPostImageUrl}
                        onChange={(e) => setNewPostImageUrl(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 bg-white text-xs text-neutral-800 focus:outline-none focus:border-emerald-800 h-full font-semibold placeholder:text-neutral-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>학습지 / 문서 첨부 (선택) - HWP, PDF 등 가능</span>
                  {newPostFileUrl && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setNewPostFileUrl('');
                        setNewPostFileData('');
                        if (postDocumentFileInputRef.current) postDocumentFileInputRef.current.value = '';
                      }}
                      className="text-[10px] text-rose-500 font-extrabold hover:underline"
                    >
                      삭제
                    </button>
                  )}
                </label>
                {newPostFileUrl ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-5 h-5 text-emerald-800 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-neutral-800 truncate">{newPostFileUrl}</p>
                        <p className="text-[10px] text-emerald-700 font-medium">첨부된 문서 파일</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPostFileUrl('');
                        setNewPostFileData('');
                        if (postDocumentFileInputRef.current) postDocumentFileInputRef.current.value = '';
                      }}
                      className="text-xs bg-white hover:bg-rose-50 text-rose-500 font-bold border border-rose-100 rounded-lg px-2 py-1 transition-colors"
                    >
                      제거
                    </button>
                  </div>
                ) : (
                  <div className="border border-dashed border-emerald-300 rounded-xl p-3 bg-emerald-50/20 text-center relative hover:bg-emerald-50 transition-colors flex flex-col justify-center items-center">
                    <input 
                      type="file" 
                      accept=".pdf,.hwp,.hwpx,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" 
                      ref={postDocumentFileInputRef}
                      onChange={handlePostDocumentUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileText className="w-5 h-5 text-emerald-800 mb-1" />
                    <span className="block font-black text-[10px] text-neutral-800">기기 내 한글파일(HWP), PDF, 워드 등 첨부</span>
                    <span className="block text-[9px] text-neutral-400 font-medium mt-0.5">드래그하거나 누르세요 (최대 15MB)</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">동영상/참조 링크 URL (선택)</label>
                <input
                  id="form-post-linkurl"
                  type="url"
                  placeholder="예: https://www.youtube.com/... (또는 외부 학습 주소)"
                  value={newPostLinkUrl}
                  onChange={(e) => setNewPostLinkUrl(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:border-emerald-850 text-sm font-semibold"
                />
              </div>
              </div>
              )}

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddPostModal(false);
                    setPostModalTab('add');
                    setEditingPostId(null);
                  }}
                  className="px-4 py-2.5 rounded-xl border font-bold text-neutral-500 hover:bg-neutral-50 text-xs transition-colors"
                >
                  작성취소
                </button>
                <button
                  type="submit"
                  disabled={postModalTab === 'edit' && !editingPostId}
                  className={`font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all ${
                    postModalTab === 'edit'
                      ? 'bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-200 disabled:text-neutral-400 text-white shadow-md'
                      : 'bg-emerald-900 hover:bg-emerald-850 text-white shadow-md'
                  }`}
                >
                  {postModalTab === 'edit' ? '✏️ 수정사항 저장하기' : '게시 발행 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PLATFORM OPERATION & ROLE AUTH ================= */}
      {showAuthModal && (
        <div 
          id="role-auth-modal" 
          className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => { setShowAuthModal(false); setAuthPasscode(''); }}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-2 bg-emerald-900" />
            <form onSubmit={handleAuthSubmit} className="p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xl text-neutral-900 flex items-center gap-2">
                  🔒 플랫폼 자치 운영진 인증
                </h3>
                <button 
                  type="button" 
                  onClick={() => { setShowAuthModal(false); setAuthPasscode(''); }}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                원곡중학교 스포츠 원더풀 플랫폼은 교사 관리자뿐 아니라, <strong>학생 자치 운영단이 스스로</strong> 부적절한 게시글 및 미디어를 모니터링하고 자율 정화할 수 있도록 지원합니다.
              </p>

              {/* Current Role display */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-bold">현재 내 로그인 상태:</span>
                <span className={`px-3 py-1.5 rounded-full font-black ${
                  userRole === 'student_council' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : userRole === 'admin'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-neutral-200 text-neutral-700'
                }`}>
                  {userRole === 'student_council' ? '🛡️ 학생 자치단' : userRole === 'admin' ? '👑 교사 관리자' : '👤 일반 학생 (로그아웃됨)'}
                </span>
              </div>

              {/* Role selection tab */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-neutral-500 uppercase tracking-wider">인증하려는 권한 대상</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedAuthRole('student_council'); setAuthPasscode(''); }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      selectedAuthRole === 'student_council'
                        ? 'border-emerald-800 bg-emerald-50/50 ring-2 ring-emerald-800'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-600" /> 학생 자치단
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold leading-tight">스스로 게시물 블라인드 및 자율 정화 권한</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedAuthRole('admin'); setAuthPasscode(''); }}
                    className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                      selectedAuthRole === 'admin'
                        ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500'
                        : 'border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xs font-black text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 교사 관리자
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold leading-tight">게시물/미디어 영구 삭제, 강제 수정 마스터 권한</span>
                  </button>
                </div>
              </div>

              {/* Passcode input */}
              <div className="space-y-1.5">
                <label 
                  onClick={() => {
                    setLabelClickCount(prev => {
                      const next = prev + 1;
                      if (next >= 5) {
                        setShowDebugHint(true);
                        triggerHud("💡 시뮬레이션 디버그 힌트가 활성화되었습니다!", "success");
                        return 0;
                      }
                      return next;
                    });
                  }}
                  className="block text-xs font-black text-neutral-500 uppercase tracking-wider cursor-pointer select-none"
                  title="5번 연속 클릭하면 디버그 힌트를 볼 수 있습니다"
                >
                  비밀번호 인증 코드
                </label>
                <input
                  type="password"
                  value={authPasscode}
                  onChange={(e) => setAuthPasscode(e.target.value)}
                  placeholder="지정된 패스코드를 입력해주세요"
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-800 text-sm font-semibold"
                />
                
                {/* 힌트 박스 (나만 볼 수 있도록 기본적으로 가려짐) */}
                {showDebugHint && (
                  <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 mt-2 text-[10px] text-neutral-600 font-medium space-y-0.5 animate-fade-in">
                    <p className="font-bold text-amber-800 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" /> 시뮬레이션 테스트를 위한 힌트:
                    </p>
                    <p>• 학생 자치단 비밀번호: <code className="bg-emerald-500/10 text-emerald-800 px-1 py-0.5 rounded font-bold font-mono">wongok123</code></p>
                    <p>• 최고 관리자 비밀번호: <code className="bg-amber-500/20 text-amber-900 px-1 py-0.5 rounded font-bold font-mono">dnjsdnwl5800!@</code></p>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                {userRole !== 'student' ? (
                  <button
                    type="button"
                    onClick={handleLogoutRole}
                    className="px-4 py-2.5 rounded-xl border font-bold text-rose-500 hover:bg-rose-50 border-rose-200 text-xs transition-colors"
                  >
                    일반 학생으로 전환
                  </button>
                ) : (
                  <div />
                )}
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowAuthModal(false); setAuthPasscode(''); }}
                    className="px-4 py-2.5 rounded-xl border font-bold text-neutral-500 hover:bg-neutral-50 text-xs transition-colors"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-900 hover:bg-emerald-850 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md"
                  >
                    인증하기
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: RENT SPORT GEAR FORM ================= */}
      {showRentalModal && activeRentalItem && (
        <div 
          id="add-rental-wizard-modal" 
          className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => { setShowRentalModal(false); setActiveRentalItem(null); }}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1.5 bg-amber-500" />
            <form onSubmit={handleRentSubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-lg text-neutral-900">체육 장비 오아시스 대여</h3>
                <button 
                  type="button" 
                  onClick={() => { setShowRentalModal(false); setActiveRentalItem(null); }}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-amber-50 p-3.5 border border-amber-200 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-extrabold shrink-0">
                  ⚽
                </div>
                <div>
                  <span className="block text-xs text-amber-800 font-bold">대여 대상 비품</span>
                  <span className="block font-black text-sm md:text-base text-neutral-800 truncate leading-tight mt-0.5">{activeRentalItem.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">대여 목적 학급</label>
                <input
                  id="form-rental-class"
                  type="text"
                  required
                  placeholder="예: 3학년 2반 기말후 특별활동"
                  value={renterClass}
                  onChange={(e) => setRenterClass(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:border-amber-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">대여자 학번 & 실명</label>
                <input
                  id="form-rental-renter"
                  type="text"
                  required
                  placeholder="예: 30214 김도윤 대표"
                  value={renterName}
                  onChange={(e) => setRenterName(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:border-amber-500 text-sm font-semibold"
                />
              </div>

              <div className="text-[10px] text-neutral-400 font-medium">
                ⚠️ 체육 대표장비는 오아시스 시간 (쉬는 시간, 점심시간) 종료 전까지 안전하게 반납 및 장비 수 확인을 진행해 주세요.
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => { setShowRentalModal(false); setActiveRentalItem(null); }}
                  className="px-4 py-2 rounded-xl border font-bold text-neutral-500 hover:bg-neutral-50 text-xs transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-emerald-900 hover:bg-emerald-850 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all"
                >
                  대여 승인 제출
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD SPORT MATCH FOR SCOREBOARD ================= */}
      {showAddMatchModal && (
        <div 
          id="add-match-wizard-modal" 
          className="fixed inset-0 bg-neutral-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAddMatchModal(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1.5 bg-rose-500" />
            <form onSubmit={handleCreateMatch} className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-extrabold text-lg text-neutral-900">새 교육 경기 대진 편성</h3>
                <button 
                  type="button" 
                  onClick={() => setShowAddMatchModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">스포츠 종목</label>
                <select
                  id="form-match-sport"
                  value={newMatchSport}
                  onChange={(e) => setNewMatchSport(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 bg-white text-neutral-800 focus:outline-none focus:border-emerald-800 text-sm font-semibold"
                >
                  {['축구', '농구', '배드민턴', '피구', '족구', '줄다리기'].map(sp => (
                    <option key={sp} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">팀 A (좌측 진영 명칭)</label>
                <input
                  id="form-match-teama"
                  type="text"
                  required
                  placeholder="예: 3학년 5반 (레드팀)"
                  value={newMatchTeamA}
                  onChange={(e) => setNewMatchTeamA(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:border-emerald-800 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">팀 B (우측 진영 명칭)</label>
                <input
                  id="form-match-teamb"
                  type="text"
                  required
                  placeholder="예: 3학년 7반 (블루팀)"
                  value={newMatchTeamB}
                  onChange={(e) => setNewMatchTeamB(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:border-emerald-800 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-1.5">경기 시행 시간대</label>
                <input
                  id="form-match-time"
                  type="text"
                  placeholder="예: 점심시간 12:50"
                  value={newMatchTime}
                  onChange={(e) => setNewMatchTime(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-neutral-800 focus:outline-none focus:border-emerald-800 text-sm font-semibold"
                />
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMatchModal(false)}
                  className="px-4 py-2 rounded-xl border font-bold text-neutral-500 hover:bg-neutral-50 text-xs transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-emerald-900 hover:bg-emerald-850 text-white font-extrabold text-xs px-5 py-2 rounded-xl transition-all"
                >
                  대진 편성 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Footer section */}
      <footer id="main-application-footer" className="bg-neutral-950 text-neutral-300 py-16 px-6 shadow-2xl border-t border-neutral-800 mt-20 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* 스포츠 원더풀 */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-neutral-900 rounded-xl border border-neutral-800">
                <WongokLogo className="w-12 h-12 filter brightness-110" />
              </div>
              <div>
                <span className="block text-white font-black text-lg tracking-tight">원곡중학교 스포츠 원더풀</span>
                <span className="text-[10px] text-amber-400 uppercase font-black tracking-widest block mt-0.5">Wongok Wonderful Sports Platform</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-medium">
              원곡중학교 원더풀 스포츠는 우리 학생들이 스스로 계획하고 운영하는 주도형 자치 체육 네트워크이자 내외 디지털 학습을 가로지르는 스마트 소통 플랫폼입니다. 뜨거운 리그전의 한계 극복 노정과 함께 성장하는 연대의 전율을 이 공간에서 함께 키워갑니다.
            </p>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">#자치스포츠</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">#학생주도형</span>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded">#페어플레이</span>
            </div>
          </div>

          {/* 스포츠 약속 수칙 */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <h4 className="text-white font-extrabold text-sm tracking-wide uppercase">원곡중 자치 스포츠 약속 수칙</h4>
            </div>
            <ul className="text-xs text-neutral-400 space-y-3 font-medium">
              <li className="flex items-start gap-2.5 bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block mb-0.5">손 내밀어 배려하기</strong>
                  경기 중 일어나는 의도치 않은 충돌 상황에서는 호각 소리 이전에 먼저 넘어진 상대에게 정중하게 손을 뻗어 서로를 배려합니다.
                </span>
              </li>
              <li className="flex items-start gap-2.5 bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block mb-0.5">자치 판정 절대 신뢰하기</strong>
                  공식 자격 수료와 훈련 과정을 거친 학생 심판단의 당당한 수신호 및 중재 판결을 철저히 존중하고 질서정연하게 따릅니다.
                </span>
              </li>
              <li className="flex items-start gap-2.5 bg-neutral-900/40 p-3 rounded-xl border border-neutral-900">
                <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block mb-0.5">사용한 환경 정돈하기</strong>
                  사용 완료한 공유 스포츠 기자재는 이물질을 곱게 닦아 보관함에 반납하고, 관람 구역에 잔여 쓰레기를 남기지 않습니다.
                </span>
              </li>
            </ul>
          </div>

          {/* 문의처 */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" />
              <h4 className="text-white font-extrabold text-sm tracking-wide uppercase">문의처 안내</h4>
            </div>
            <div className="text-xs text-neutral-400 space-y-4 font-medium leading-relaxed bg-neutral-900/25 p-5 rounded-2xl border border-neutral-900">
              <div className="space-y-1.5">
                <span className="text-neutral-500 block text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3 h-3" /> 전화번호
                </span>
                <span className="text-neutral-200 block text-sm font-bold">031-599-9612</span>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-neutral-900">
                <span className="text-neutral-500 block text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3 h-3" /> 이메일 주소
                </span>
                <a href="mailto:dn1510@naver.com" className="text-amber-400 hover:text-amber-300 block text-sm font-bold hover:underline break-all">
                  dn1510@naver.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
