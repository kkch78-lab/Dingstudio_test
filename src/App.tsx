import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  CirclePlus,
  CheckCircle2,
  Eye,
  FileDown,
  FileText,
  Film,
  Flame,
  Heart,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  Pencil,
  Phone,
  Play,
  Search,
  Shield,
  Sparkles,
  Trash2,
  Trophy,
  Upload,
  User,
  Video,
  X,
  Zap
} from 'lucide-react';
import { BadgeLogo } from './components/BadgeLogo';
import { VideoPlayer } from './components/VideoPlayer';
import { parseVideoMedia } from './utils/mediaHelper';
import { storeVideoMedia, loadVideoMedia, deleteVideoMedia } from './utils/mediaStorage';
import { optimizeImageFile } from './utils/imageOptimizer';
import { Post, RentalItem, MatchItem, UserRole, ToastInfo } from './types';
import { INITIAL_POSTS, INITIAL_RENTALS, INITIAL_MATCHES, INITIAL_ANNOUNCEMENTS } from './data/initialData';

export function App() {
  // Navigation & Role State
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem('wongok_role') as UserRole) || 'student';
    } catch {
      return 'student';
    }
  });

  // Data State with Safe LocalStorage Fallback
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('wongok_posts');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });
  const [rentals, setRentals] = useState<RentalItem[]>(() => {
    try {
      const saved = localStorage.getItem('wongok_rentals');
      return saved ? JSON.parse(saved) : INITIAL_RENTALS;
    } catch {
      return INITIAL_RENTALS;
    }
  });
  const [matches, setMatches] = useState<MatchItem[]>(() => {
    try {
      const saved = localStorage.getItem('wongok_matches');
      return saved ? JSON.parse(saved) : INITIAL_MATCHES;
    } catch {
      return INITIAL_MATCHES;
    }
  });

  // Modals & UI Controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authTargetRole, setAuthTargetRole] = useState<'student_council' | 'admin'>('student_council');
  const [authPassword, setAuthPassword] = useState<string>('');

  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [postModalMode, setPostModalMode] = useState<'add' | 'edit'>('add');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [isRentalModalOpen, setIsRentalModalOpen] = useState<boolean>(false);
  const [selectedRentalItem, setSelectedRentalItem] = useState<RentalItem | null>(null);
  const [renterName, setRenterName] = useState<string>('');
  const [renterClass, setRenterClass] = useState<string>('');

  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const [matchSport, setMatchSport] = useState<string>('축구');
  const [matchTeamA, setMatchTeamA] = useState<string>('');
  const [matchTeamB, setMatchTeamB] = useState<string>('');
  const [matchTime, setMatchTime] = useState<string>('');

  const [activeReaderPost, setActiveReaderPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const [announcementIdx, setAnnouncementIdx] = useState<number>(0);

  // Form fields for Add/Edit Post
  const [formCategory, setFormCategory] = useState<string>('자유');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formFileUrl, setFormFileUrl] = useState<string>('');
  const [formFileData, setFormFileData] = useState<string>('');
  const [formLinkUrl, setFormLinkUrl] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formImageFileName, setFormImageFileName] = useState<string>('');
  const [formImageFileSize, setFormImageFileSize] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);
  const [formVideoData, setFormVideoData] = useState<string>('');
  const [formVideoFileName, setFormVideoFileName] = useState<string>('');
  const [formVideoFileSize, setFormVideoFileSize] = useState<number>(0);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(false);

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Safe LocalStorage Sync Helper
  const safeSetLocalStorage = (key: string, data: any) => {
    try {
      if (key === 'wongok_posts' && Array.isArray(data)) {
        // Strip out heavy base64 strings from localStorage to strictly avoid QuotaExceededError.
        // Full videos and high-res images are persistently saved in IndexedDB and loaded automatically into memory.
        const sanitized = data.map((item) => {
          let copy = { ...item };
          if (copy.videoData && copy.videoData.length > 20000) {
            copy.hasStoredVideo = true;
            copy.videoData = '';
          }
          if (copy.imageUrl && copy.imageUrl.length > 30000) {
            copy.hasStoredImage = true;
            copy.imageUrl = '';
          }
          return copy;
        });
        localStorage.setItem(key, JSON.stringify(sanitized));
        return;
      }
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      try {
        if (Array.isArray(data)) {
          const trimmed = data.map((item) => {
            return {
              ...item,
              videoData: '',
              imageUrl: item.imageUrl && item.imageUrl.length > 30000 ? '' : item.imageUrl,
              fileData: ''
            };
          });
          localStorage.setItem(key, JSON.stringify(trimmed));
        }
      } catch {
        // Ignore storage errors safely
      }
    }
  };

  // Sync to LocalStorage safely without throwing QuotaExceededError
  useEffect(() => {
    safeSetLocalStorage('wongok_posts', posts);
  }, [posts]);

  useEffect(() => {
    safeSetLocalStorage('wongok_rentals', rentals);
  }, [rentals]);

  useEffect(() => {
    safeSetLocalStorage('wongok_matches', matches);
  }, [matches]);

  useEffect(() => {
    try {
      localStorage.setItem('wongok_role', userRole);
    } catch {
      // Ignore
    }
  }, [userRole]);

  // Rolling announcement timer
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % INITIAL_ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Hydrate videos and images from IndexedDB on initial mount
  useEffect(() => {
    const hydrateMedia = async () => {
      try {
        const hydrated = await Promise.all(
          posts.map(async (p: Post) => {
            let updated = { ...p };
            if ((p.hasStoredVideo || !p.videoData) && (p.videoFileName || p.videoSourceType === 'file')) {
              const cachedVideo = await loadVideoMedia(p.id);
              if (cachedVideo) updated.videoData = cachedVideo;
            }
            if ((p.hasStoredImage || !p.imageUrl) && (p.imageFileName || p.hasStoredImage)) {
              const cachedImg = await loadVideoMedia('img_' + p.id);
              if (cachedImg) updated.imageUrl = cachedImg;
            }
            return updated;
          })
        );
        setPosts(hydrated);
      } catch {
        // Silently fallback
      }
    };
    hydrateMedia();
  }, []);

  // Hydrate video or image when activeReaderPost opens
  useEffect(() => {
    if (activeReaderPost && activeReaderPost.id) {
      if (!activeReaderPost.videoData && (activeReaderPost.hasStoredVideo || activeReaderPost.videoFileName)) {
        loadVideoMedia(activeReaderPost.id).then((cached) => {
          if (cached) {
            setActiveReaderPost((prev) =>
              prev && prev.id === activeReaderPost.id ? { ...prev, videoData: cached } : prev
            );
          }
        });
      }
      if (!activeReaderPost.imageUrl && (activeReaderPost.hasStoredImage || activeReaderPost.imageFileName)) {
        loadVideoMedia('img_' + activeReaderPost.id).then((cached) => {
          if (cached) {
            setActiveReaderPost((prev) =>
              prev && prev.id === activeReaderPost.id ? { ...prev, imageUrl: cached } : prev
            );
          }
        });
      }
    }
  }, [activeReaderPost?.id]);

  // Filtered posts based on active tab and search query
  const filteredPosts = useMemo(() => {
    let result = posts;

    if (currentTab !== 'home') {
      const categoryMap: Record<string, string> = {
        class: '자유',
        club: '스포츠클럽',
        festival: '학생체육지원단',
        oasis: '내가 바로 원곡 릴스꾼',
        referee: '학생심판지원단(기자단)'
      };
      const cat = categoryMap[currentTab];
      if (cat) {
        result = result.filter((p) => p.category === cat);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.content || '').toLowerCase().includes(q) ||
          (p.author || '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [posts, currentTab, searchQuery]);

  // Auth Handler
  const isManager = userRole === 'admin' || userRole === 'student_council';

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inputPassword = authPassword.trim();

    if (authTargetRole === 'admin') {
      if (inputPassword === 'wongok1004') {
        setUserRole('admin');
        showToast('👑 교사 관리자 모드로 성공적으로 전환되었습니다!', 'success');
        setAuthPassword('');
        setIsAuthModalOpen(false);
      } else {
        showToast('비밀번호가 올바르지 않습니다. 다시 확인해 주세요.', 'error');
      }
    } else if (authTargetRole === 'student_council') {
      if (inputPassword === 'wongok1004' || inputPassword === 'wongok123') {
        setUserRole('student_council');
        showToast('🛡️ 학생 자치 운영단 모드로 성공적으로 전환되었습니다!', 'success');
        setAuthPassword('');
        setIsAuthModalOpen(false);
      } else {
        showToast('비밀번호가 올바르지 않습니다. 다시 확인해 주세요.', 'error');
      }
    }
  };

  const handleLogoutRole = () => {
    setUserRole('student');
    showToast('일반 학생 권한으로 돌아왔습니다.', 'info');
    setIsAuthModalOpen(false);
  };

  // Open Post Writer Modal
  const openAddPost = (initialCategory?: string) => {
    setPostModalMode('add');
    setEditingPostId(null);

    let defaultCat = '자유';
    if (initialCategory) {
      defaultCat = initialCategory;
    } else if (currentTab === 'oasis') {
      defaultCat = '내가 바로 원곡 릴스꾼';
    } else if (currentTab === 'club') {
      defaultCat = '스포츠클럽';
    } else if (currentTab === 'festival') {
      defaultCat = '학생체육지원단';
    } else if (currentTab === 'referee') {
      defaultCat = '학생심판지원단(기자단)';
    }

    setFormCategory(defaultCat);
    setFormTitle('');
    setFormAuthor(userRole === 'admin' ? '체육교사' : userRole === 'student_council' ? '학생체육지원단' : '원곡중 학생');
    setFormContent('');
    setFormFileUrl('');
    setFormFileData('');
    setFormLinkUrl('');
    setFormImageUrl('');
    setFormImageFileName('');
    setFormImageFileSize(0);
    setIsImageLoading(false);
    setFormVideoData('');
    setFormVideoFileName('');
    setFormVideoFileSize(0);
    setIsVideoLoading(false);
    setIsPostModalOpen(true);
  };

  // Open Post Editor Modal
  const openEditPost = (post: Post) => {
    if (!isManager) {
      showToast('게시물 수정은 운영진(교사 또는 학생자치단) 인증 후 가능합니다.', 'error');
      setAuthTargetRole('student_council');
      setIsAuthModalOpen(true);
      return;
    }
    setPostModalMode('edit');
    setEditingPostId(post.id);
    setFormCategory(post.category);
    setFormTitle(post.title);
    setFormAuthor(post.author);
    setFormContent(post.content);
    setFormFileUrl(post.fileUrl || '');
    setFormFileData(post.fileData || '');
    setFormLinkUrl(post.linkUrl || '');
    setFormImageUrl(post.imageUrl || '');
    setFormImageFileName(post.imageFileName || '');
    setFormImageFileSize(post.imageFileSize || 0);
    setIsImageLoading(false);
    setFormVideoData(post.videoData || '');
    setFormVideoFileName(post.videoFileName || '');
    setFormVideoFileSize(post.videoFileSize || 0);
    setIsVideoLoading(false);

    // If media is empty but stored in IndexedDB, fetch it for editor
    if (!post.videoData && post.id) {
      loadVideoMedia(post.id).then((cached) => {
        if (cached) setFormVideoData(cached);
      });
    }
    if (!post.imageUrl && post.id && (post.hasStoredImage || post.imageFileName)) {
      loadVideoMedia('img_' + post.id).then((cached) => {
        if (cached) setFormImageUrl(cached);
      });
    }

    setIsPostModalOpen(true);
  };

  // Handle Save Post (Instant Immediate Posting with Zero Delay & Zero Errors)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isImageLoading) {
      showToast('사진 최적화 작업이 진행 중입니다. 잠시만 기다려주세요.', 'info');
      return;
    }

    if (isVideoLoading) {
      showToast('동영상 처리 작업이 진행 중입니다. 잠시만 기다려주세요.', 'info');
      return;
    }

    const titleToSave = formTitle.trim() || '원곡 스포츠 소식';
    const contentToSave = formContent.trim() || '내용이 없습니다.';
    const authorToSave = formAuthor.trim() || (userRole === 'admin' ? '체육교사' : '원곡중 구성원');

    const newPostId = postModalMode === 'edit' && editingPostId ? editingPostId : `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload: Post = {
      id: newPostId,
      category: formCategory,
      title: titleToSave,
      author: authorToSave,
      content: contentToSave,
      date: new Date().toISOString().split('T')[0],
      views: 0,
      fileUrl: formFileUrl,
      fileData: formFileData,
      linkUrl: formLinkUrl,
      imageUrl: formImageUrl,
      imageFileName: formImageFileName,
      imageFileSize: formImageFileSize,
      hasStoredImage: Boolean(formImageUrl),
      videoUrl: undefined,
      videoData: formVideoData,
      videoFileName: formVideoFileName,
      videoFileSize: formVideoFileSize,
      hasStoredVideo: Boolean(formVideoData),
      videoSourceType: formVideoData ? 'file' : undefined
    };

    // Store in IndexedDB for reliable high-capacity video & photo persistence
    if (formVideoData) {
      await storeVideoMedia(newPostId, formVideoData, formVideoFileName, undefined, formVideoFileSize);
    }
    if (formImageUrl) {
      await storeVideoMedia('img_' + newPostId, formImageUrl, formImageFileName, 'image/jpeg', formImageFileSize);
    }

    // 1. Instant Optimistic UI Update (Immediate display, zero draft, zero delay)
    if (postModalMode === 'edit' && editingPostId) {
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === editingPostId ? { ...p, ...payload } : p))
      );
      if (activeReaderPost && activeReaderPost.id === editingPostId) {
        setActiveReaderPost({ ...activeReaderPost, ...payload });
      }
      showToast('✅ 게시물이 성공적으로 수정 및 반영되었습니다.', 'success');
    } else {
      setPosts((prevPosts) => [payload, ...prevPosts]);
      showToast('🎉 소식/자료가 즉시 등록되어 게시되었습니다!', 'success');
    }

    // 2. Close modal immediately for a seamless user experience
    setIsPostModalOpen(false);
  };

  // Toggle Blind / Flag
  const handleToggleFlag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const target = posts.find((p) => p.id === id);
    if (!target) return;

    const nextFlag = !target.isFlagged;
    const confirmMsg = nextFlag
      ? '이 게시물을 부적절한 게시물로 분류하여 일반 학생들에게 블라인드 처리하겠습니까?'
      : '이 게시물의 블라인드 처리를 해제하고 일반 학생들에게 다시 노출하겠습니까?';

    if (!window.confirm(confirmMsg)) return;

    const updatePayload = {
      isFlagged: nextFlag,
      flaggedReason: nextFlag ? '학생자치회/관리자 검토에 의해 블라인드 처리된 게시물입니다.' : ''
    };

    setPosts(posts.map((p) => (p.id === id ? { ...p, ...updatePayload } : p)));
    showToast(nextFlag ? '게시물이 블라인드(가림) 처리되었습니다.' : '게시물 블라인드가 해제되었습니다.');
    if (activeReaderPost?.id === id) {
      setActiveReaderPost({ ...activeReaderPost, ...updatePayload });
    }
  };

  // Delete Post (Managers Only)
  const handleDeletePost = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isManager) {
      showToast('게시물 삭제는 운영진(교사 또는 학생자치단) 인증 후 가능합니다.', 'error');
      setAuthTargetRole('student_council');
      setIsAuthModalOpen(true);
      return;
    }
    if (!window.confirm('운영진 권한으로 이 자료를 영구 삭제하시겠습니까?')) return;

    deleteVideoMedia(id);
    deleteVideoMedia('img_' + id);
    setPosts(posts.filter((p) => p.id !== id));
    showToast('자료가 성공적으로 삭제되었습니다.');
    if (activeReaderPost?.id === id) setActiveReaderPost(null);
  };

  // Open Reader & Increment Views
  const handleOpenReader = (post: Post) => {
    setActiveReaderPost(post);
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, views: p.views + 1 } : p)));
  };

  // Rent Equipment Submit
  const handleRentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalItem) return;
    if (!renterName || !renterClass) {
      showToast('대여자 이름 및 대여목적 학급을 입력해 주세요.', 'error');
      return;
    }

    setRentals((prev) =>
      prev.map((r) =>
        r.id === selectedRentalItem.id
          ? {
              ...r,
              rented: Math.min(r.total, r.rented + 1),
              renter: `${renterClass} ${renterName}`,
              classRoom: '체육 활동 지원'
            }
          : r
      )
    );
    showToast(`[${selectedRentalItem.name}] 자재 대여가 승인되었습니다.`);

    setRenterName('');
    setRenterClass('');
    setIsRentalModalOpen(false);
    setSelectedRentalItem(null);
  };

  // Return Equipment (Admin / Council)
  const handleReturnEquipment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRentals((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, rented: Math.max(0, r.rented - 1) } : r
      )
    );
    showToast('물품 반납이 완료되었습니다.');
  };

  // Add Match Submit
  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchTeamA || !matchTeamB) {
      showToast('팀 이름을 모두 입력해주세요.', 'error');
      return;
    }

    const payload: MatchItem = {
      id: `match_loc_${Date.now()}`,
      sport: matchSport,
      teamA: matchTeamA,
      teamB: matchTeamB,
      time: matchTime || '점심시간 자율전',
      scoreA: 0,
      scoreB: 0,
      status: 'scheduled'
    };

    setMatches((prev) => [...prev, payload]);
    showToast('새 스포츠 대진 매치가 생성되었습니다.');

    setMatchTeamA('');
    setMatchTeamB('');
    setMatchTime('');
    setIsMatchModalOpen(false);
  };

  // File Upload Helper (FileReader Base64)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormFileUrl(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormFileData(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Photo / Image Upload Helper (Optimizes high-res phone camera photos to prevent quota & memory crashes)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reject files over 50MB
    if (file.size > 50 * 1024 * 1024) {
      showToast('사진 파일 용량은 최대 50MB까지 지원됩니다.', 'error');
      return;
    }

    setIsImageLoading(true);
    setFormImageFileName(file.name);

    // Instant Object URL for immediate preview without lag
    const tempUrl = URL.createObjectURL(file);
    setFormImageUrl(tempUrl);

    try {
      const optimized = await optimizeImageFile(file, 1920, 0.85);
      setFormImageUrl(optimized.dataUrl);
      setFormImageFileName(optimized.fileName);
      setFormImageFileSize(optimized.optimizedSize);
      setIsImageLoading(false);

      const origSize = optimized.originalSize > 1024 * 1024
        ? `${(optimized.originalSize / (1024 * 1024)).toFixed(1)}MB`
        : `${Math.round(optimized.originalSize / 1024)}KB`;
      const optSize = `${Math.round(optimized.optimizedSize / 1024)}KB`;

      showToast(`사진 최적화 완료! (${origSize} → ${optSize})`, 'success');
    } catch (err: any) {
      console.warn('Image optimization fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
          setFormImageFileSize(file.size);
          setIsImageLoading(false);
          showToast(`사진 [${file.name}] 첨부 완료`, 'success');
        }
      };
      reader.onerror = () => {
        setIsImageLoading(false);
        showToast('사진 파일을 불러오는 중 오류가 발생했습니다.', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormImageUrl('');
    setFormImageFileName('');
    setFormImageFileSize(0);
    setIsImageLoading(false);
    showToast('첨부된 사진이 삭제되었습니다.', 'info');
  };

  // Video File Upload (Supports MP4, MOV, WebM, 숏폼/릴스 up to 100MB with zero loss)
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        showToast('동영상 파일 용량은 최대 100MB까지 지원됩니다.', 'error');
        return;
      }

      setIsVideoLoading(true);
      setFormVideoFileName(file.name);
      setFormVideoFileSize(file.size);

      // Instant Blob Object URL for immediate zero-lag preview
      const objectUrl = URL.createObjectURL(file);
      setFormVideoData(objectUrl);

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormVideoData(reader.result);
          setIsVideoLoading(false);
          const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
          showToast(`동영상 [${file.name}] (${sizeMB}MB) 준비가 완료되었습니다.`, 'success');
        }
      };
      reader.onerror = () => {
        setIsVideoLoading(false);
        showToast('동영상 처리 중 알림: 임시 미리보기 모드로 전환되었습니다.', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveVideo = () => {
    setFormVideoData('');
    setFormVideoFileName('');
    setFormVideoFileSize(0);
    setIsVideoLoading(false);
    showToast('첨부된 동영상이 삭제되었습니다.', 'info');
  };

  return (
    <div id="wongok-sports-app" className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-rose-500 selection:text-white">
      {/* HUD Floating Toast Notification */}
      {toast && (
        <div
          id="system-toast-hud"
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs md:text-sm font-bold backdrop-blur-md animate-fade-in border ${
            toast.type === 'error'
              ? 'bg-rose-900/90 text-rose-100 border-rose-700'
              : toast.type === 'info'
              ? 'bg-slate-900/90 text-slate-100 border-slate-700'
              : 'bg-emerald-900/90 text-emerald-100 border-emerald-700'
          }`}
        >
          {toast.type === 'error' ? (
            <CircleAlert className="w-4 h-4 text-rose-400 shrink-0" />
          ) : toast.type === 'info' ? (
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          ) : (
            <CircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Top Global White Navigation Bar */}
      <nav id="top-white-navbar" className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Left Brand Identity */}
          <div
            id="brand-logo-button"
            onClick={() => {
              setCurrentTab('home');
              setSearchQuery('');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              <BadgeLogo className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center leading-none">
                <span className="text-sm md:text-base font-black text-slate-900 tracking-tight">
                  원곡중학교
                </span>
              </div>
              <span className="text-[10.5px] font-bold text-emerald-700 block mt-1 tracking-tight">
                원더풀 스포츠 플랫폼
              </span>
            </div>
          </div>

          {/* Center Navigation Menus */}
          <div className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'home', label: '종합 마당', icon: Sparkles },
              { id: 'class', label: '자유', icon: BookOpen },
              { id: 'club', label: '스포츠클럽', icon: Trophy },
              { id: 'festival', label: '체육대회', icon: Flame },
              { id: 'oasis', label: '내가 바로 원곡 릴스꾼', icon: Zap },
              { id: 'referee', label: '학생심판지원단(기자단)', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-menu-tab-${tab.id}`}
                  onClick={() => {
                    setCurrentTab(tab.id);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs md:text-sm font-extrabold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#064e3b] text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              id="role-switch-trigger-btn"
              onClick={() => setIsAuthModalOpen(true)}
              className={`text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-xs border ${
                userRole === 'admin'
                  ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : userRole === 'student_council'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              {userRole === 'admin' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>👑 교사 관리자 (운영진)</span>
                </>
              ) : userRole === 'student_council' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>🛡️ 학생 자치단 (운영진)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>🔑 운영진 인증</span>
                </>
              )}
            </button>

            <button
              id="btn-add-post-modal-open"
              onClick={() => openAddPost()}
              className="bg-[#ff1e56] hover:bg-[#e01448] text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-rose-200"
            >
              <CirclePlus className="w-4 h-4" />
              <span>소식/자료 등록</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-100 gap-1 no-scrollbar">
          {[
            { id: 'home', label: '종합 마당', icon: Sparkles },
            { id: 'class', label: '자유', icon: BookOpen },
            { id: 'club', label: '스포츠클럽', icon: Trophy },
            { id: 'festival', label: '체육대회', icon: Flame },
            { id: 'oasis', label: '내가 바로 원곡 릴스꾼', icon: Zap },
            { id: 'referee', label: '학생심판지원단(기자단)', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 shrink-0 ${
                  isActive ? 'bg-[#064e3b] text-white' : 'text-slate-600 bg-slate-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Brand Hero Section (Deep Forest Green) */}
      <header id="main-hero-header" className="bg-[#042e23] text-white relative overflow-hidden shadow-lg border-b border-emerald-900">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center lg:text-left flex-1">
              {/* Badge Tag */}
              <div className="inline-flex items-center gap-1.5 border border-amber-400 text-amber-400 bg-black/20 text-xs font-bold px-3.5 py-1 rounded-full backdrop-blur-sm shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>원곡중학교 원더풀 스포츠 & 학생 주도 플랫폼</span>
              </div>

              {/* Main Headline */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                  스포츠 <span className="text-amber-400 font-black">원더풀!</span> 너의 열정을{' '}
                  <span className="text-[#ff5277]">WON THE</span> <span className="text-[#ff1e56]">FULL</span>로 깨워라!
                </h1>
                <p className="text-emerald-100/80 text-sm md:text-base font-normal mt-4 max-w-2xl leading-relaxed">
                  스스로 한계를 깨뜨리고 함께 성장하는 주인공이 되어라! 원곡의 리더십을 발휘하여 뜨거운 도전과 혁신의 전율을 지금 이곳에서 함께 나누고 채워가세요.
                </p>
              </div>

              {/* 3 Quick Value Stat Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 max-w-2xl">
                <div className="bg-[#0e4839]/80 border border-emerald-600/30 backdrop-blur-sm p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                  <div className="p-2 rounded-xl bg-emerald-900/60 text-amber-400 shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-emerald-300/80 font-bold">활발한 리그</div>
                    <div className="text-xs font-black text-white">열정의 아침&주말 리그전</div>
                  </div>
                </div>

                <div className="bg-[#0e4839]/80 border border-emerald-600/30 backdrop-blur-sm p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                  <div className="p-2 rounded-xl bg-emerald-900/60 text-rose-400 shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-emerald-300/80 font-bold">공정한 경기와 존중</div>
                    <div className="text-xs font-black text-white">정정당당 존중 페어플레이</div>
                  </div>
                </div>

                <div className="bg-[#0e4839]/80 border border-emerald-600/30 backdrop-blur-sm p-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
                  <div className="p-2 rounded-xl bg-emerald-900/60 text-teal-300 shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-emerald-300/80 font-bold">학생 리더십</div>
                    <div className="text-xs font-black text-white">주도적인 학생지원단</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emblem Badge Container with Lime Glow */}
            <div className="shrink-0 flex items-center justify-center relative bg-[#0a382c]/80 p-6 md:p-8 rounded-3xl border border-emerald-500/30 shadow-[0_0_50px_rgba(74,222,128,0.18)] backdrop-blur-md">
              <BadgeLogo className="w-48 h-48 md:w-56 md:h-56" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-8">
        {currentTab === 'home' ? (
          <div id="home-dashboard-layout" className="space-y-10 animate-fade-in">
            {/* WON-the FULL Project Concept Card */}
            <div
              id="wonthefull-concept-card"
              className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200/80 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden transition-all hover:shadow-md"
            >
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-800 text-emerald-100 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      PROJECT CONCEPT
                    </span>
                    <span className="text-rose-600 font-extrabold text-xs px-1.5 py-0.5 border border-rose-300 bg-rose-50 rounded">
                      WON-the FULL
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-emerald-950 flex flex-wrap items-baseline gap-2">
                    <span>원더풀 프로젝트</span>
                    <span className="text-sm md:text-base font-semibold text-slate-500">
                      (WON–the FULL)
                    </span>
                  </h3>
                  <p className="text-emerald-900 text-sm font-medium">
                    ✨ 원곡의 <span className="font-bold text-emerald-900">원(WON)</span>,{' '}
                    <span className="font-bold text-rose-600">the FULL</span> ={' '}
                    <span className="italic font-bold text-emerald-950">원곡을 가득 채우다</span>
                  </p>
                </div>
              </div>

              {/* 4 Core Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {[
                  {
                    letter: 'F',
                    word: 'Freedom',
                    title: '자유',
                    desc: '시공간의 제약에 대한 자유',
                    detail: '아침 오아시스, 방과후 프로그램, 주말리그전 포괄',
                    color: 'text-amber-600 bg-amber-50 border-amber-200'
                  },
                  {
                    letter: 'U',
                    word: 'Understanding',
                    title: '상호이해',
                    desc: '상생과 통합',
                    detail: '스포츠클럽간의 교류 화합 및 존중 페어플레이',
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-200'
                  },
                  {
                    letter: 'L',
                    word: 'Leadership',
                    title: '리더십',
                    desc: '스포츠 자치 문화 실현',
                    detail: '학생 심판, 학생 체육지원단 주체화 및 경기 진행',
                    color: 'text-rose-600 bg-rose-50 border-rose-200'
                  },
                  {
                    letter: 'L',
                    word: 'Learner-centered',
                    title: '학습자 중심',
                    desc: '교육과정 운영',
                    detail: '선택 중심의 자기주도 체육 교육과정 및 숏폼 창작',
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
                  }
                ].map((pillar, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200/80 hover:border-emerald-500/40 rounded-2xl p-4.5 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center border ${pillar.color}`}>
                        {pillar.letter}
                      </span>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block -mb-0.5">
                          {pillar.word}
                        </span>
                        <span className="font-black text-slate-800 text-sm">
                          {pillar.title}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-700 leading-snug">
                      {pillar.desc}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400 mt-1 leading-relaxed">
                      {pillar.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Sub-Area Shortcuts Grid */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <h3 className="text-emerald-950 font-black text-xl flex items-center gap-2">
                  <span className="w-2.5 h-5 bg-emerald-800 rounded" />
                  원더풀 핵심 영역별 바로가기
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  원하는 영역 카드를 클릭하여 해당 마당으로 바로 이동할 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    id: 'class',
                    label: '자유',
                    badge: 'F (Freedom)',
                    icon: BookOpen,
                    accentClass: 'border-amber-200 bg-amber-50/30 text-amber-900 hover:border-amber-400',
                    badgeColors: 'bg-amber-100 text-amber-800 border-amber-200',
                    features: ['자율적인 아침 체육 활동', '주도적인 방과후 스포츠클럽', '함께 즐기는 주말 리그전']
                  },
                  {
                    id: 'club',
                    label: '스포츠클럽 소식지',
                    badge: 'U (Understanding)',
                    icon: Trophy,
                    accentClass: 'border-emerald-200 bg-emerald-50/30 text-emerald-900 hover:border-emerald-400',
                    badgeColors: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    features: ['상호 배려와 포용의 스포츠 대회', '존중을 바탕으로 한 친선 경기', '협동과 신뢰의 화합 리그전']
                  },
                  {
                    id: 'festival',
                    label: '학생체육지원단',
                    badge: 'L (Leadership)',
                    icon: Flame,
                    accentClass: 'border-rose-200 bg-rose-50/30 text-rose-900 hover:border-rose-400',
                    badgeColors: 'bg-rose-100 text-rose-800 border-rose-200',
                    features: ['리더십을 발휘하는 학년 교류', '공동 목표를 위한 주체적 분담', '공정함과 격려의 체육대회']
                  },
                  {
                    id: 'oasis',
                    label: '내가 바로 원곡 릴스꾼',
                    badge: 'L (Learner-centered)',
                    icon: Zap,
                    accentClass: 'border-indigo-200 bg-indigo-50/30 text-indigo-900 hover:border-indigo-400',
                    badgeColors: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                    features: ['학습자 중심의 자발적 체육 릴스', '스스로 제작·공유하는 숏폼', '개성과 흥미 중심의 활기찬 배움']
                  },
                  {
                    id: 'referee',
                    label: '학생심판지원단(기자단)',
                    badge: 'L (Leadership)',
                    icon: Shield,
                    accentClass: 'border-rose-200 bg-rose-50/30 text-rose-900 hover:border-rose-400',
                    badgeColors: 'bg-rose-100 text-rose-800 border-rose-200',
                    features: ['학생 심판 지원단 운영', '스포츠 경기 학생 기자단', '학생 심판 표준 매뉴얼 목록']
                  }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      id={`home-shortcut-card-${item.id}`}
                      onClick={() => setCurrentTab(item.id)}
                      className={`group border rounded-2xl p-5 cursor-pointer bg-white transition-all hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between ${item.accentClass}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 shadow-sm group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5 text-emerald-900" />
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${item.badgeColors}`}>
                            {item.badge}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-base text-slate-900 mb-2">{item.label}</h4>
                        <div className="space-y-1.5 border-t border-slate-100 pt-3.5 mb-5 select-none text-left">
                          <span className="block text-[10px] text-slate-400 font-bold tracking-wider mb-2 uppercase">
                            주요 활동 내용
                          </span>
                          {item.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600 font-semibold">
                              <span className="text-emerald-700 mt-0.5 shrink-0">✓</span>
                              <span className="leading-snug">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-2 text-xs font-bold text-emerald-900 group-hover:underline">
                        <span>세부자료실 입장하기</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Popular Reels Showcase Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg border border-slate-800">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase mb-3 inline-block">
                    🔥 실시간 인기 코너
                  </span>
                  <h3 className="text-xl md:text-2xl font-black mb-2">
                    내가 바로 원곡 릴스꾼! 지금 바로 참여해봐!
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm max-w-lg mb-4 leading-relaxed">
                    체육시간 열정 가득한 릴스, 개성 넘치는 세로 숏폼 영상, 스포츠클럽 골장면 하이라이트를 올리고 함께 소통하세요!
                  </p>
                  <button
                    onClick={() => setCurrentTab('oasis')}
                    className="bg-rose-500 hover:bg-rose-600 border border-rose-500 text-white px-5 py-2.5 rounded-xl text-xs md:text-sm font-extrabold flex items-center gap-1.5 transition-all shadow shadow-rose-950"
                  >
                    <span>릴스 마당 참가하기</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2.5 p-2 bg-slate-800/80 rounded-2xl border border-slate-700/60 shrink-0">
                  <div className="w-24 h-24 bg-rose-950/30 rounded-xl border border-rose-500/50 flex flex-col items-center justify-center text-center p-2">
                    <Play className="w-6 h-6 text-rose-500 animate-pulse fill-rose-500" />
                    <span className="text-[10px] mt-1.5 font-bold text-rose-300">숏폼 촬영방</span>
                  </div>
                  <div className="w-24 h-24 bg-amber-950/30 rounded-xl border border-amber-500/50 flex flex-col items-center justify-center text-center p-2">
                    <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                    <span className="text-[10px] mt-1.5 font-bold text-amber-300">인기 릴스꾼</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Sub-Board View (자유, 스포츠클럽, 학생체육지원단, 내가 바로 원곡 릴스꾼, 학생심판지원단) */
          <div id="posts-sharing-board-tab" className="space-y-6 animate-fade-in">
            {/* Header for Active Category */}
            <div className="bg-white border border-slate-200 text-emerald-900 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {currentTab === 'class' && '자유 자료 공유실'}
                    {currentTab === 'club' && '스포츠클럽 소식지 마당'}
                    {currentTab === 'festival' && '학생체육지원단 소통방'}
                    {currentTab === 'oasis' && '내가 바로 원곡 릴스꾼 마당'}
                    {currentTab === 'referee' && '학생심판지원단(기자단) 정보실'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {currentTab === 'class' && '아침 오아시스, 방과후, 자율 스포츠 활동에 대한 자료를 확인하고 공유하세요.'}
                    {currentTab === 'club' && '학교스포츠클럽 리그전 결과, 소식지 및 참가 신청 안내입니다.'}
                    {currentTab === 'festival' && '원곡 원더풀 체육대회 기획 및 학생지원단 활동 공지입니다.'}
                    {currentTab === 'oasis' && '체육시간 릴스 영상, 사진, 숏폼을 자유롭게 올리고 소통하는 공간입니다.'}
                    {currentTab === 'referee' && '학생 심판 규칙 가이드, 판정 핸드북 및 경기 취재 기사 모음입니다.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => openAddPost()}
                className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow shadow-rose-950 shrink-0"
              >
                <CirclePlus className="w-4 h-4" />
                <span>{currentTab === 'oasis' ? '나도 릴스 올리기' : '자료 게시하기'}</span>
              </button>
            </div>

            {/* Tab Specific Guidance Box */}
            {currentTab === 'referee' && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-black mb-1">🛡️ 원곡중 학생 심판 행동 강령</div>
                  <div className="font-medium text-amber-800 leading-relaxed">
                    1. 모든 판정은 공정하고 투명하게 내린다. 2. 판정에 불응하는 행위에 대해서는 단호하되 정중하게 설명한다. 3. 경기 전후 안전 점검을 최우선으로 시행한다.
                  </div>
                </div>
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="제목, 내용, 작성자로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-600 text-slate-800"
                />
              </div>
              <div className="text-xs text-slate-500 font-bold self-end sm:self-center">
                검색 결과: <span className="text-emerald-800 font-black">{filteredPosts.length}</span>건
              </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">등록된 게시물이 없습니다.</h4>
                <p className="text-xs text-slate-400">첫 번째 자료나 릴스를 직접 올려보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPosts.map((post) => {
                  const isBlind = post.isFlagged && userRole === 'student';
                  return (
                    <div
                      key={post.id}
                      id={`post-card-${post.id}`}
                      onClick={() => !isBlind && handleOpenReader(post)}
                      className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                        isBlind
                          ? 'border-amber-200 bg-amber-50/20'
                          : 'border-slate-200 hover:border-emerald-500/40 hover:shadow-md cursor-pointer'
                      }`}
                    >
                      <div>
                        {/* Top Category & Author */}
                        <div className="flex items-center justify-between mb-3 text-[11px] font-bold">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1 text-slate-500 font-medium">
                            <User className="w-3 h-3" />
                            {post.author}
                          </span>
                        </div>

                        {/* Title & Preview / Blind notice */}
                        {isBlind ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 px-4 bg-amber-50/60 rounded-xl border border-dashed border-amber-300 min-h-[120px] my-2">
                            <CircleAlert className="w-7 h-7 text-amber-600 mb-1.5" />
                            <p className="text-xs font-black text-amber-950">부적절성 우려로 블라인드 처리됨</p>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                              원곡중 자치 규정에 의해 학생 자치단에서 임시로 노출을 제한하였습니다.
                            </p>
                          </div>
                        ) : (
                          <div className={post.isFlagged ? 'opacity-70' : ''}>
                            {/* Media Preview: Image or Video */}
                            {post.imageUrl ? (
                              <div className="mb-3 rounded-xl overflow-hidden max-h-40 bg-slate-100 border border-slate-200 relative group">
                                <img
                                  src={post.imageUrl}
                                  alt={post.title}
                                  className="w-full h-36 object-cover hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                {post.imageFileName && (
                                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[10px] font-bold text-emerald-300 flex items-center gap-1 backdrop-blur-sm">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>사진</span>
                                  </span>
                                )}
                              </div>
                            ) : (post.videoData || post.videoUrl || post.videoFileName) ? (
                              <div className="mb-3 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group">
                                {(() => {
                                  const media = parseVideoMedia(post.videoUrl, post.videoData);
                                  if (media.thumbnailUrl) {
                                    return (
                                      <div className="relative w-full h-36 bg-black flex items-center justify-center overflow-hidden">
                                        <img
                                          src={media.thumbnailUrl}
                                          alt={post.title}
                                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all">
                                          <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="w-5 h-5 fill-white ml-0.5" />
                                          </div>
                                        </div>
                                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[10px] font-bold text-rose-300 flex items-center gap-1">
                                          <Film className="w-3 h-3" />
                                          <span>{media.platformLabel || 'YouTube 영상'}</span>
                                        </span>
                                      </div>
                                    );
                                  }
                                  if (post.videoData) {
                                    return (
                                      <div className="relative w-full h-36 bg-black flex items-center justify-center">
                                        <video
                                          src={post.videoData}
                                          preload="metadata"
                                          className="w-full h-36 object-cover opacity-80"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all">
                                          <div className="w-10 h-10 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                            <Play className="w-5 h-5 fill-white ml-0.5" />
                                          </div>
                                        </div>
                                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                                          <Film className="w-3 h-3" />
                                          <span className="truncate max-w-[140px]">{post.videoFileName || '첨부 영상'}</span>
                                        </span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="relative w-full h-36 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 flex flex-col items-center justify-center p-3 text-center">
                                      <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-1.5">
                                        <Play className="w-5 h-5 fill-white ml-0.5" />
                                      </div>
                                      <span className="text-[11px] font-bold text-rose-200 truncate max-w-full px-2">
                                        {post.videoFileName || media.platformLabel || '영상 미디어 재생'}
                                      </span>
                                    </div>
                                  );
                                })()}
                              </div>
                            ) : null}
                            <h4 className="font-extrabold text-slate-900 text-sm md:text-base mb-1.5 line-clamp-2 leading-snug hover:text-emerald-800 transition-colors">
                              {post.title}
                            </h4>
                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4">
                              {post.content}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {post.views}
                          </span>

                          {(post.fileUrl || post.fileData) && !isBlind && (
                            <span className="p-1 rounded bg-emerald-50 text-emerald-800" title="첨부파일 있음">
                              <FileDown className="w-3.5 h-3.5" />
                            </span>
                          )}

                          {(post.videoUrl || post.videoData) && !isBlind && (
                            <span className="p-1 rounded bg-rose-50 text-rose-700 flex items-center gap-0.5" title={post.videoData ? '직접 첨부 영상' : '영상 링크'}>
                              <Play className="w-3.5 h-3.5 fill-rose-700" />
                            </span>
                          )}

                          {/* Blind Toggle Button for Student Council & Admin */}
                          {isManager && (
                            <button
                              onClick={(e) => handleToggleFlag(post.id, e)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                post.isFlagged
                                  ? 'bg-amber-500 text-white border-amber-600'
                                  : 'text-slate-400 border-slate-200 hover:text-amber-600 hover:bg-amber-50'
                              }`}
                              title={post.isFlagged ? '블라인드 해제' : '블라인드 처리'}
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit & Delete: ONLY for Authenticated Managers (Teachers / Student Council) */}
                          {isManager && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditPost(post);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-colors flex items-center gap-1 text-[11px] font-bold"
                                title="운영진 권한: 게시물 수정"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">수정</span>
                              </button>

                              <button
                                onClick={(e) => handleDeletePost(post.id, e)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center gap-1 text-[11px] font-bold"
                                title="운영진 권한: 게시물 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">삭제</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Post Reader Modal */}
      {activeReaderPost && (
        <div
          id="post-reader-modal"
          className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setActiveReaderPost(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 bg-emerald-800 w-full" />
            <div className="p-6 md:p-8 overflow-y-auto space-y-6">
              {/* Reader Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                    {activeReaderPost.category}
                  </span>
                  <button
                    onClick={() => setActiveReaderPost(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                  {activeReaderPost.title}
                </h3>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-semibold mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-bold text-slate-700">
                      <User className="w-3.5 h-3.5" /> {activeReaderPost.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {activeReaderPost.date}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> 조회수 {activeReaderPost.views}
                  </span>
                </div>
              </div>

              {/* Image Preview */}
              {activeReaderPost.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 group relative">
                  <img
                    src={activeReaderPost.imageUrl}
                    alt={activeReaderPost.title}
                    className="w-full max-h-[500px] object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="px-3.5 py-2 bg-slate-900 text-slate-300 flex items-center justify-between text-[11px] border-t border-slate-800">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>{activeReaderPost.imageFileName || '첨부 사진'}</span>
                      {activeReaderPost.imageFileSize ? (
                        <span className="text-slate-400 font-normal">
                          ({Math.round(activeReaderPost.imageFileSize / 1024)}KB)
                        </span>
                      ) : null}
                    </span>
                    <a
                      href={activeReaderPost.imageUrl}
                      download={activeReaderPost.imageFileName || 'wongok_photo.jpg'}
                      className="text-slate-300 hover:text-white flex items-center gap-1 hover:underline font-bold"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>사진 원본 저장</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Content Body */}
              <div className="text-slate-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                {activeReaderPost.content}
              </div>

              {/* Video Player (Direct Upload / YouTube / Web Video) */}
              {(activeReaderPost.videoUrl || activeReaderPost.videoData || activeReaderPost.videoFileName) && (
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-rose-500" />
                    <span>첨부된 영상 미디어 ({activeReaderPost.videoFileName || '원곡중 스포츠 미디어'})</span>
                  </div>
                  <VideoPlayer
                    videoUrl={activeReaderPost.videoUrl}
                    videoData={activeReaderPost.videoData}
                    videoFileName={activeReaderPost.videoFileName}
                    title={activeReaderPost.title}
                  />
                </div>
              )}

              {/* File Download Attachment */}
              {(activeReaderPost.fileUrl || activeReaderPost.fileData) && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
                      <FileDown className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-emerald-950">첨부 문서 파일</div>
                      <div className="text-[11px] text-emerald-800">{activeReaderPost.fileUrl || '다운로드 파일'}</div>
                    </div>
                  </div>
                  {activeReaderPost.fileData ? (
                    <a
                      href={activeReaderPost.fileData}
                      download={activeReaderPost.fileUrl || 'wongok_attachment.pdf'}
                      className="px-3.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 hover:bg-emerald-700"
                    >
                      <span>파일 받기</span>
                      <FileDown className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-emerald-700 font-bold">학교 내부망 제공 파일</span>
                  )}
                </div>
              )}
            </div>

            {/* Reader Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {isManager ? (
                  <>
                    <button
                      onClick={() => {
                        openEditPost(activeReaderPost);
                        setActiveReaderPost(null);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>게시물 수정 (운영진)</span>
                    </button>
                    <button
                      onClick={(e) => handleDeletePost(activeReaderPost.id, e)}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>게시물 삭제 (운영진)</span>
                    </button>
                    <button
                      onClick={(e) => handleToggleFlag(activeReaderPost.id, e)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${
                        activeReaderPost.isFlagged
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'border-slate-200 text-slate-700 hover:bg-white'
                      }`}
                    >
                      {activeReaderPost.isFlagged ? '블라인드 해제' : '블라인드 처리'}
                    </button>
                  </>
                ) : (
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>게시물 수정 및 삭제는 <strong>운영진 인증</strong> 후 가능합니다.</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setActiveReaderPost(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Post Wizard Modal */}
      {isPostModalOpen && (
        <div
          id="add-post-wizard-modal"
          className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsPostModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 bg-rose-500 w-full" />
            <form onSubmit={handleSavePost} className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {postModalMode === 'edit' ? '마당 게시물 수정' : '소식 / 자료 / 릴스 바로 등록'}
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    ✨ 교사, 학생지원단, 심판단, 일반 학생 누구나 자유롭게 즉시 등록 가능
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Identity Selector for Anyone (Teachers, Student Council/Support, Referees, Regular Students) */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 space-y-2">
                <div className="text-[11px] font-extrabold text-emerald-900 flex items-center justify-between">
                  <span>작성 주체 간편 선택 (원클릭)</span>
                  <span className="text-[10px] text-emerald-700 font-normal">직접 수정 입력도 가능합니다</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '👨‍🏫 체육 교사', value: '체육교사', category: '자유' },
                    { label: '🛡️ 학생체육지원단', value: '학생체육지원단', category: '학생체육지원단' },
                    { label: '📢 심판단(기자단)', value: '학생심판지원단', category: '학생심판지원단(기자단)' },
                    { label: '🙋 일반 학생', value: '원곡중 학생', category: '내가 바로 원곡 릴스꾼' },
                    { label: '⚽ 스포츠클럽', value: '스포츠클럽 부원', category: '스포츠클럽' }
                  ].map((identity) => (
                    <button
                      key={identity.label}
                      type="button"
                      onClick={() => {
                        setFormAuthor(identity.value);
                        if (postModalMode === 'add') {
                          setFormCategory(identity.category);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                        formAuthor.includes(identity.value)
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                          : 'bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {identity.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  공유 영역 카테고리
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-700"
                >
                  <option value="자유">자유</option>
                  <option value="스포츠클럽">스포츠클럽</option>
                  <option value="학생체육지원단">학생체육지원단</option>
                  <option value="내가 바로 원곡 릴스꾼">내가 바로 원곡 릴스꾼</option>
                  <option value="학생심판지원단(기자단)">학생심판지원단(기자단)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  작성자 명칭 (이름, 학번)
                </label>
                <input
                  type="text"
                  placeholder="예: 김원곡 (30215) 또는 체육교사"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  게시물 제목
                </label>
                <input
                  type="text"
                  required
                  placeholder="제목을 입력하세요"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  내용
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="공유할 내용, 경기 후기, 릴스 소개, 응원 메시지를 작성해주세요..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-700 leading-relaxed"
                />
              </div>

              {/* Direct Video File Attachment Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-rose-500" />
                    <span>동영상 파일 첨부 (내 기기 직접 업로드)</span>
                  </label>
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    선택 사항
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="border-2 border-dashed border-rose-200 bg-white rounded-xl p-3.5 text-center hover:border-rose-400 transition-colors">
                    <Film className="w-6 h-6 text-rose-400 mx-auto mb-1" />
                    <div className="text-xs font-black text-slate-800">
                      {formVideoData ? '새 동영상 파일로 교체하기' : '동영상 파일 선택 또는 드래그'}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      MP4, MOV, WebM, 숏폼/릴스 세로 영상 (최대 100MB 고화질 지원)
                    </p>
                    <input
                      type="file"
                      accept="video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi"
                      onChange={handleVideoUpload}
                      className="mt-2 text-[11px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-500 file:text-white file:hover:bg-rose-600 file:cursor-pointer cursor-pointer"
                    />
                  </div>

                  {/* In-Progress Loading Indicator */}
                  {isVideoLoading && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-bold animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600 shrink-0" />
                      <span>대용량 동영상 파일을 안전하게 처리 중입니다... 잠시만 기다려주세요.</span>
                    </div>
                  )}

                  {formVideoData && (
                    <div className="p-3 bg-white rounded-xl border border-rose-200 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                          <span className="text-xs font-bold text-slate-800 truncate">
                            첨부 완료: {formVideoFileName || '동영상 파일'}
                            {formVideoFileSize > 0 && ` (${(formVideoFileSize / (1024 * 1024)).toFixed(1)}MB)`}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>동영상 삭제</span>
                        </button>
                      </div>
                      {/* Interactive live preview via resilient VideoPlayer */}
                      <VideoPlayer
                        videoData={formVideoData}
                        videoFileName={formVideoFileName}
                        compact
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Photo & Document Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Photo Upload Box */}
                <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>대표 사진 첨부</span>
                      </div>
                      {formImageUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>사진 삭제</span>
                        </button>
                      )}
                    </div>

                    {isImageLoading ? (
                      <div className="py-5 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-dashed border-emerald-300">
                        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin mb-1" />
                        <p className="text-xs font-bold text-slate-700">고화질 사진 최적화 중...</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">오류 방지를 위해 안전하게 처리 중입니다.</p>
                      </div>
                    ) : formImageUrl ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 max-h-36 flex items-center justify-center">
                          <img
                            src={formImageUrl}
                            alt="첨부 사진 미리보기"
                            className="max-h-36 w-full object-contain"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-[10px] font-bold text-emerald-300 flex items-center gap-1 backdrop-blur-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>사진 등록 완료</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] px-0.5">
                          <span className="text-slate-600 font-medium truncate max-w-[150px]">
                            {formImageFileName || '사진 파일'}
                            {formImageFileSize > 0 && ` (${Math.round(formImageFileSize / 1024)}KB)`}
                          </span>
                          <label className="cursor-pointer text-emerald-700 hover:text-emerald-800 font-bold text-[11px] underline">
                            사진 변경
                            <input
                              type="file"
                              accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-4 px-3 border border-dashed border-slate-300 rounded-xl bg-white hover:bg-emerald-50/40 hover:border-emerald-300 cursor-pointer transition-all text-center group">
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 mb-1 transition-colors" />
                        <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">
                          사진 선택하기
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          스마트폰 고화질 원본도 오류 없이 자동 최적화
                        </span>
                        <input
                          type="file"
                          accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Document File Upload */}
                <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <FileDown className="w-4 h-4 text-slate-500" />
                        <span>문서 파일 첨부</span>
                      </div>
                      {formFileData && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormFileData('');
                            setFormFileUrl('');
                          }}
                          className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>문서 삭제</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="w-full mt-1 text-[11px] text-slate-500 file:mr-2.5 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-emerald-100 file:text-emerald-800"
                    />
                    {formFileData && (
                      <div className="mt-2 text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-white p-2 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{formFileUrl || '문서 파일 첨부됨'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>임시 저장 없이 버튼을 누르면 즉시 전체 마당에 실시간 게시됩니다.</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-500 hover:bg-slate-50 text-xs transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isVideoLoading || isImageLoading}
                    className={`font-black text-xs px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
                      isVideoLoading || isImageLoading
                        ? 'bg-slate-400 text-white cursor-not-allowed'
                        : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-950/20'
                    }`}
                  >
                    {isImageLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>사진 최적화 중...</span>
                      </>
                    ) : isVideoLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>동영상 준비 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{postModalMode === 'edit' ? '수정 내용 즉시 반영' : '바로 올리기 (즉시 등록)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Switcher & Auth Modal */}
      {isAuthModalOpen && (
        <div
          id="auth-wizard-modal"
          className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 bg-amber-500" />
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  사용자 권한 전환
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthTargetRole('student_council')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authTargetRole === 'student_council' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  학생 자치 운영단
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTargetRole('admin')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    authTargetRole === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  교사 관리자
                </button>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1">
                  비밀번호 입력
                </label>
                <input
                  type="password"
                  required
                  placeholder="운영진 비밀번호를 입력하세요"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full border rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all"
                >
                  권한 전환 완료
                </button>
                {userRole !== 'student' && (
                  <button
                    type="button"
                    onClick={handleLogoutRole}
                    className="w-full text-slate-500 hover:bg-slate-50 font-bold text-xs py-2 rounded-xl border"
                  >
                    일반 학생 모드로 되돌리기
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Rental Modal */}
      {isRentalModalOpen && (
        <div
          id="equipment-rental-modal"
          className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsRentalModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 bg-emerald-800" />
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">체육 기자재 대여 및 반납 센터</h3>
                  <p className="text-xs text-slate-500">원곡중 학생 누구나 자율 체육활동을 위해 신청할 수 있습니다.</p>
                </div>
                <button
                  onClick={() => setIsRentalModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedRentalItem ? (
                <form onSubmit={handleRentSubmit} className="space-y-4 bg-slate-50 p-4 rounded-2xl border">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-900">선택 물품: {selectedRentalItem.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRentalItem(null)}
                      className="text-xs text-slate-400 hover:underline"
                    >
                      목록으로
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">신청 학급</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 2학년 3반"
                        value={renterClass}
                        onChange={(e) => setRenterClass(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">신청자 이름</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 홍길동"
                        value={renterName}
                        onChange={(e) => setRenterName(e.target.value)}
                        className="w-full border rounded-xl px-3 py-2 text-xs bg-white"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-black text-xs py-2.5 rounded-xl"
                  >
                    대여 신청 제출
                  </button>
                </form>
              ) : (
                <div className="space-y-3">
                  {rentals.map((item) => {
                    const available = item.total - item.rented;
                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 hover:border-emerald-500/40 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                              {item.category}
                            </span>
                            <span className="font-extrabold text-sm text-slate-900">{item.name}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            총 {item.total}개 중 <span className="font-bold text-emerald-800">{available}개 대여가능</span>
                            {item.renter && <span className="text-slate-400 text-[11px] ml-2">(최근 대여: {item.renter})</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {available > 0 ? (
                            <button
                              onClick={() => setSelectedRentalItem(item)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-900 text-white text-xs font-bold hover:bg-emerald-800"
                            >
                              대여하기
                            </button>
                          ) : (
                            <span className="text-xs text-rose-600 font-bold px-2 py-1 bg-rose-50 rounded-lg">대여불가</span>
                          )}

                          {(userRole === 'student_council' || userRole === 'admin') && item.rented > 0 && (
                            <button
                              onClick={(e) => handleReturnEquipment(item.id, e)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 text-xs font-bold hover:bg-slate-100"
                              title="반납 처리"
                            >
                              반납
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Match Scheduler Wizard Modal */}
      {isMatchModalOpen && (
        <div
          id="match-wizard-modal"
          className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsMatchModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2 bg-rose-500" />
            <form onSubmit={handleAddMatch} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900">새 교육 경기 대진 편성</h3>
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1">스포츠 종목</label>
                <select
                  value={matchSport}
                  onChange={(e) => setMatchSport(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 bg-white"
                >
                  {['축구', '농구', '배드민턴', '피구', '족구', '줄다리기'].map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1">팀 A 명칭</label>
                <input
                  type="text"
                  required
                  placeholder="예: 3학년 5반 (레드)"
                  value={matchTeamA}
                  onChange={(e) => setMatchTeamA(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1">팀 B 명칭</label>
                <input
                  type="text"
                  required
                  placeholder="예: 3학년 7반 (블루)"
                  value={matchTeamB}
                  onChange={(e) => setMatchTeamB(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 mb-1">경기 일시/장소</label>
                <input
                  type="text"
                  placeholder="예: 점심시간 12:50 (체육관)"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-500"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-emerald-900 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2 rounded-xl"
                >
                  대진 편성 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Application Footer */}
      <footer id="main-application-footer" className="bg-[#0b0f0e] text-slate-300 py-12 px-4 md:px-8 border-t border-slate-800/80 mt-20 select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-[#121a17] rounded-2xl border border-[#1e2a25] shrink-0">
                <BadgeLogo className="w-12 h-12" />
              </div>
              <div>
                <span className="block text-white font-extrabold text-base tracking-tight">
                  원곡중학교 스포츠 원더풀
                </span>
                <span className="block text-amber-400 text-xs font-semibold">
                  원곡 원더풀 스포츠 플랫폼
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md font-normal">
              원곡중학교 원더풀 스포츠는 우리 학생들이 스스로 계획하고 운영하는 주도형 자치 체육 네트워크이자 내외 디지털 학습을 가로지르는 스마트 소통 플랫폼입니다. 뜨거운 리그전의 한계 극복 노정과 함께 성장하는 연대의 전율을 이 공간에서 함께 키워갑니다.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="bg-[#240e14] text-[#ff4b6e] border border-[#ff4b6e]/30 px-2.5 py-1 rounded-md text-[11px] font-bold">
                #자치스포츠
              </span>
              <span className="bg-[#0e2417] text-[#22c55e] border border-[#22c55e]/30 px-2.5 py-1 rounded-md text-[11px] font-bold">
                #학생주도형
              </span>
              <span className="bg-[#0e1d28] text-[#38bdf8] border border-[#38bdf8]/30 px-2.5 py-1 rounded-md text-[11px] font-bold">
                #페어플레이
              </span>
            </div>
          </div>

          {/* Column 2: Promise Rules */}
          <div className="lg:col-span-4 space-y-3">
            <h5 className="font-extrabold text-white text-sm flex items-center gap-1.5 mb-3">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>원곡중 자치 스포츠 약속 수칙</span>
            </h5>

            <div className="space-y-2.5">
              <div className="bg-[#101714] border border-[#1d2923] rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-white mb-1">
                  <CircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>손 내밀어 배려하기</span>
                </div>
                <p className="text-slate-400 text-[11px] pl-6 leading-relaxed">
                  경기 중 일어나는 의도치 않은 충돌 상황에서는 호각 소리 이전에 먼저 넘어진 상대에게 정중하게 손을 뻗어 서로를 배려합니다.
                </p>
              </div>

              <div className="bg-[#101714] border border-[#1d2923] rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-white mb-1">
                  <CircleCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>자치 판정 절대 신뢰하기</span>
                </div>
                <p className="text-slate-400 text-[11px] pl-6 leading-relaxed">
                  공식 자격 수료와 훈련 과정을 거친 학생 심판단의 당당한 수신호 및 중재 판결을 철저히 존중하고 질서정연하게 따릅니다.
                </p>
              </div>

              <div className="bg-[#101714] border border-[#1d2923] rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs font-extrabold text-white mb-1">
                  <CircleCheck className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>사용한 환경 정돈하기</span>
                </div>
                <p className="text-slate-400 text-[11px] pl-6 leading-relaxed">
                  사용 완료한 공유 스포츠 기자재는 이물질을 곱게 닦아 보관함에 반납하고, 관람 구역에 잔여 쓰레기를 남기지 않습니다.
                </p>
              </div>
            </div>
          </div>

          {/* Column 3: Contact Info */}
          <div className="lg:col-span-3 space-y-3">
            <h5 className="font-extrabold text-white text-sm flex items-center gap-1.5 mb-3">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>문의처 안내</span>
            </h5>

            <div className="bg-[#101714] border border-[#1d2923] rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>전화번호</span>
                </div>
                <div className="text-white text-base font-black tracking-wide">
                  031-599-9612
                </div>
              </div>

              <div className="border-t border-[#1d2923] pt-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>이메일 주소</span>
                </div>
                <div className="text-amber-400 text-sm font-bold tracking-wide">
                  dn1510@naver.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
