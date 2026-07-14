import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));

// Lazy initialization of Gemini agent to avoid crashing when NO key is present
const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Database storage
const DATA_FILE = path.join(__dirname, 'db.json');

interface Post {
  id: string;
  category: string; // 자유, 스포츠클럽, 체육대회, 내가 바로 원곡 릴스꾼, 학생심판지원단(기자단)
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

interface DB {
  posts: Post[];
  gallery: GalleryItem[];
  rentals: Rental[];
  matches: Match[];
}

const defaultDB: DB = {
  posts: [],
  gallery: [
    {
      id: 'g1',
      type: 'image',
      title: '2026 원더풀 축구 스포츠클럽 대표팀 통합 우승 세레머니',
      description: '땀방울로 일궈낸 기적적인 승리! 다 함께 외쳤던 "스포츠 원더풀! WON THE FULL!" 승리의 축포 현장입니다.',
      mediaUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
      uploader: '김민준 학생',
      date: '2026-05-21',
      likes: 54
    },
    {
      id: 'g2',
      type: 'image',
      title: '오아시스 점심 광장 배드민턴 열전',
      description: '점심시간만 되면 교내 탁 트인 공터와 체육관이 라켓 소리로 가득 찹니다! 활기찬 원곡중 아이들.',
      mediaUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80',
      uploader: '이영희 학생',
      date: '2026-05-20',
      likes: 42
    },
    {
      id: 'g3',
      type: 'image',
      title: '체육 융합 연구학교 미래 스마트 헬스 디바이스PAP 실전 적용',
      description: '스마트 워치를 차고 자신의 실시간 에너지 대사량과 산소 섭취 포화도를 패드로 보면서 달리는 교과혁신 현장!',
      mediaUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=800&q=80',
      uploader: '체육부장 교사',
      date: '2026-05-19',
      likes: 38
    },
    {
      id: 'g4',
      type: 'video',
      title: '원곡중학교 원더풀 스포츠클럽 홍보 및 인트로 티저',
      description: '원곡중 학생 축구/농구/피구 지원단 멤버들이 활력 넘치는 동작으로 촬영한 공식 티저 비디오.',
      mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-boys-playing-basketball-in-a-sunny-day-33924-large.mp4',
      uploader: '방송부 김수정',
      date: '2026-05-15',
      likes: 67
    }
  ],
  rentals: [
    { id: 'r1', name: '축구공 (올더스포츠 대표팀 규격 공)', total: 10, rented: 4, renter: '3학년 2반 김도윤', classRoom: '교과 5교시 연습' },
    { id: 'r2', name: '농구공 (스타 프리미엄 7호)', total: 8, rented: 2, renter: '2학년 5반 이윤제', classRoom: '오아시스 리그 연습' },
    { id: 'r3', name: '배드민턴 경량 라켓 & 셔틀콕 세트', total: 15, rented: 11, renter: '1학년 1반 최하율', classRoom: '점심 한마당 자율' },
    { id: 'r4', name: '탁구 오버사이즈 라켓 & 오방 폼볼', total: 12, rented: 3, renter: '3학년 4반 박지우', classRoom: '동아리 시간 대여' },
    { id: 'r5', name: '안전 보강 소프트 피구 폼볼', total: 8, rented: 0 }
  ],
  matches: [
    { id: 'm1', sport: '축구', teamA: '3학년 1반 (레드)', teamB: '3학년 4반 (블루)', scoreA: 2, scoreB: 1, status: 'finished', time: '5/20 완' },
    { id: 'm2', sport: '농구', teamA: '2학년 2반 (호크스)', teamB: '2학년 5반 (블스)', scoreA: 18, scoreB: 20, status: 'finished', time: '5/21 완' },
    { id: 'm3', sport: '배드민턴', teamA: '1학년 3반 (A팀)', teamB: '1학년 7반 (B팀)', scoreA: 15, scoreB: 12, status: 'playing', time: '2세트 진행중' },
    { id: 'm4', sport: '피구', teamA: '2학년 1반 (불꽃슛)', teamB: '2학년 3반 (스파이크)', scoreA: 0, scoreB: 0, status: 'scheduled', time: '5/22 13:00' }
  ]
};

function loadDB(): DB {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Failed to read database, using defaults:', err);
  }
  return defaultDB;
}

function saveDB(data: DB) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

let db = loadDB();
saveDB(db); // ensure directory has db.json

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist'));

  // Get AI Sports Coach Response
  app.post('/api/coach', async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "지문이나 질문이 전달되지 않았습니다." });
      }

      const ai = getAI();
      if (!ai) {
        // High-quality local sports assistant responses tailored beautifully for Wongok Middle School
        const p = prompt.toLowerCase();
        let intro = `[원곡중 스포츠 AI 기가-코치 오프라인 모드] 🏸\n안녕하세요! 지금은 오프라인 가이드 모드로 답변드릴게요.\n\n`;
        if (p.includes('축구') || p.includes('풋살')) {
          return res.json({ text: intro + `⚽ 축구/풋살 부상 방지 마스터팁:
1. 경기전 발목 회전 운동은 선택이 아닌 필수! 5분 이상 풀어줍니다.
2. 경기 중 상대방 슬라이딩 태클은 절대 금지(원곡중 평화 협정)!
3. 슈팅 할 때 발가락이 아닌 발등을 대고 딛는 발의 방향을 확인하세요.
4. 경기 후 굳어진 허벅지 대퇴사두근을 풀어주는 정적 햄스트링 스트레칭을 즐겨 하시기 바랍니다!` });
        } else if (p.includes('농구')) {
          return res.json({ text: intro + `🏀 농구 골밑 레이업 및 안전 가이드:
1. 공을 잡고 가속 시 점프 착지 안전 확보가 우선입니다. 상대 발등을 밟지 않도록 낙하 예상 경로를 미리 보세요.
2. 핑거 슈팅: 손바닥 전체가 아닌 '손가락 첫째 마디 끝 지점'으로 회전을 주며 밀어던지듯이 슛하세요.
3. 리바운드 경합 시 팔꿈치를 밖으로 벌리면 파울 선언의 위험이 있습니다. 안전거리를 유지하세요!` });
        } else if (p.includes('심판') || p.includes('규정') || p.includes('기자단')) {
          return res.json({ text: intro + `🏁 원곡중 학생심판지원단(기자단)(원더풀 포스) 핵심 지침:
1. 휘슬은 '짧고 강하게' (삐익!) 소리쳐서 확실하게 불어야 아티스트적인 플레이어 전원이 멈춥니다.
2. 수신호는 가슴보다 높게 팔을 완전히 뻗어 경기 파트너와 벤치에서도 단번에 알아볼 수 있게 표현하세요.
3. 애매한 판정이 있을 때는 주심의 시야각과 선심의 소통을 우선하고, 존중과 경기 예의를 양팀에 지켜주세요.
4. 학생기자단은 공정하고 투명한 기사 작성 및 릴스 제작으로 원곡인들의 열정을 빛내주세요.` });
        } else if (p.includes('릴스') || p.includes('오아시스')) {
          return res.json({ text: intro + `🌴 내가 바로 원곡 릴스꾼 숏폼 소통 마당 팁:
원곡중 학생들의 개성 활기 넘치는 체육 활동 숏폼 및 릴스 영상 소통 공간입니다!
즐거운 모습을 세로 영상으로 마음껏 뽐내고, 서로를 격려하는 따뜻한 응원의 댓글문화를 만들어 갑시다!` });
        } else if (p.includes('체육대회') || p.includes('페스티벌')) {
          return res.json({ text: intro + `🔥 원더풀 스포츠 페스티벌(체육대회) 응원 & 고득점 비법:
1. 단체 줄다리기: 온몸의 체중을 뒤로 싣고, 발을 45도 벌려 지면을 지탱하며 반 전체가 구호에 맞추어 당겨야 합니다.
2. 릴레이 바톤 터치: 받는 주자는 정지 상태가 아니라 뒤에서 다가오는 주자의 속도에 맞추어 같이 가속하면서 바톤을 받아야 바톤 드롭 부상을 예방할 수 있습니다.
3. 반별 응원점수: 이기든 지든 동료를 격려하는 함성을 보낼 때 가장 큰 보너스 점수가 가산됩니다!` });
        } else {
          return res.json({ text: intro + `🏃 원곡중 스포츠 원더풀 종합 가이드:
- 건강체력평가 PAPS 팁: 측정 전 무조건 10분간 온몸의 관절을 늘려주어 근육 긴장을 예방하세요.
- 스마트 융합 수업: 웨어러블 분석기기에 실시간 기록되는 소모 칼로리와 누적 무산소 역치를 체크해보세요.
- 더 궁금한 운동법이나 기술에 대해 질문해주세요 (예: 배드민턴 푸시, 피구 피하기 기술 등!)` });
        }
      }

      const systemInstruction = 
        "당신은 경기도 안산 원곡중학교의 '스포츠 원더풀(Wonderful) 프로젝트'의 활기차고 파이팅 넘치는 AI 코치입니다. " +
        "학생과 선생님이 자유, 스포츠클럽, 체육대회, 내가 바로 원곡 릴스꾼 마당, 학생심판지원단(기자단) 수여 등에 관한 질문을 던졌을 때, " +
        "다정하고 에너제틱하게 '원곡중 스포츠 원더풀' 로고를 상기시키는 응원의 말을 덧붙여 최고의 스포츠 기술 및 전술, 부상 방지 방법을 알려주세요. " +
        "학생들이 적극적이고 역동적인 스포츠클러버가 되도록 'WON THE FULL' 마인드를 고취시키세요!";

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini coach error:", err);
      return res.status(500).json({ error: "AI 코치를 실행하는 중 서버 내 오류가 발생했습니다." });
    }
  });

  // Get shared materials/posts
  app.get('/api/posts', (req, res) => {
    res.json(db.posts);
  });

  // Create a new material/post
  app.post('/api/posts', (req, res) => {
    const { category, title, author, content, fileUrl, fileData, linkUrl, imageUrl, videoUrl } = req.body;
    if (!category || !title || !content) {
      return res.status(400).json({ error: '필수 항목이 누락되었습니다.' });
    }
    const newPost: Post = {
      id: 'p_' + Date.now(),
      category,
      title,
      author: author || '원곡중 구성원',
      content,
      date: new Date().toISOString().split('T')[0],
      fileUrl: fileUrl || undefined,
      fileData: fileData || undefined,
      linkUrl: linkUrl || undefined,
      imageUrl: imageUrl || undefined,
      videoUrl: videoUrl || undefined,
      views: 1
    };
    db.posts.unshift(newPost);
    saveDB(db);
    res.status(201).json(newPost);
  });

  // Update an existing material/post
  app.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const { category, title, author, content, fileUrl, fileData, linkUrl, imageUrl, videoUrl, isFlagged, flaggedReason } = req.body;
    const post = db.posts.find(p => p.id === id);
    if (post) {
      if (category !== undefined) post.category = category;
      if (title !== undefined) post.title = title;
      if (author !== undefined) post.author = author || '원곡중 구성원';
      if (content !== undefined) post.content = content;
      post.fileUrl = fileUrl || undefined;
      post.fileData = fileData || undefined;
      post.linkUrl = linkUrl || undefined;
      post.imageUrl = imageUrl || undefined;
      post.videoUrl = videoUrl || undefined;
      if (isFlagged !== undefined) post.isFlagged = isFlagged;
      if (flaggedReason !== undefined) post.flaggedReason = flaggedReason;
      saveDB(db);
      res.json(post);
    } else {
      res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }
  });

  // Update an existing gallery item
  app.put('/api/gallery/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, mediaUrl, uploader, isFlagged, flaggedReason } = req.body;
    const item = db.gallery.find(g => g.id === id);
    if (item) {
      if (title !== undefined) item.title = title;
      if (description !== undefined) item.description = description;
      if (mediaUrl !== undefined) item.mediaUrl = mediaUrl;
      if (uploader !== undefined) item.uploader = uploader;
      if (isFlagged !== undefined) item.isFlagged = isFlagged;
      if (flaggedReason !== undefined) item.flaggedReason = flaggedReason;
      saveDB(db);
      res.json(item);
    } else {
      res.status(404).json({ error: '미디어 아이템을 찾을 수 없습니다.' });
    }
  });

  // Post view tracker
  app.post('/api/posts/view', (req, res) => {
    const { id } = req.body;
    const post = db.posts.find(p => p.id === id);
    if (post) {
      post.views += 1;
      saveDB(db);
      res.json({ success: true, views: post.views });
    } else {
      res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }
  });

  // Delete post
  app.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = db.posts.length;
    db.posts = db.posts.filter(p => p.id !== id);
    if (db.posts.length < initialLen) {
      saveDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }
  });

  // Get gallery items
  app.get('/api/gallery', (req, res) => {
    res.json(db.gallery);
  });

  // Create a gallery item
  app.post('/api/gallery', (req, res) => {
    const { type, title, description, mediaUrl, uploader } = req.body;
    if (!mediaUrl || !title) {
      return res.status(400).json({ error: '필수 미디어 정보가 누락되었습니다.' });
    }
    const newItem: GalleryItem = {
      id: 'g_' + Date.now(),
      type: type === 'video' ? 'video' : 'image',
      title,
      description: description || '',
      mediaUrl,
      uploader: uploader || '원곡중 학생',
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };
    db.gallery.unshift(newItem);
    saveDB(db);
    res.status(201).json(newItem);
  });

  // Highlight gallery like
  app.post('/api/gallery/like', (req, res) => {
    const { id } = req.body;
    const item = db.gallery.find(g => g.id === id);
    if (item) {
      item.likes += 1;
      saveDB(db);
      res.json({ success: true, likes: item.likes });
    } else {
      res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }
  });

  // Delete gallery item
  app.delete('/api/gallery/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = db.gallery.length;
    db.gallery = db.gallery.filter(g => g.id !== id);
    if (db.gallery.length < initialLen) {
      saveDB(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }
  });

  // Get rental items
  app.get('/api/rentals', (req, res) => {
    res.json(db.rentals);
  });

  // Rent item
  app.post('/api/rentals/rent', (req, res) => {
    const { id, renter, classRoom } = req.body;
    const item = db.rentals.find(r => r.id === id);
    if (item) {
      if (item.rented < item.total) {
        item.rented += 1;
        item.renter = renter || '체육부 자치회';
        item.classRoom = classRoom || '운동장 및 자율코트';
        saveDB(db);
        res.json({ success: true, item });
      } else {
        res.status(400).json({ error: '대여 한도를 초과했습니다.' });
      }
    } else {
      res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }
  });

  // Return item
  app.post('/api/rentals/return', (req, res) => {
    const { id } = req.body;
    const item = db.rentals.find(r => r.id === id);
    if (item) {
      if (item.rented > 0) {
        item.rented -= 1;
        if (item.rented === 0) {
          delete item.renter;
          delete item.classRoom;
        }
        saveDB(db);
        res.json({ success: true, item });
      } else {
        res.status(400).json({ error: '이미 모든 장비가 반납완료 상태입니다.' });
      }
    } else {
      res.status(404).json({ error: '아이템을 찾을 수 없습니다.' });
    }
  });

  // Get active matches scoreboard
  app.get('/api/matches', (req, res) => {
    res.json(db.matches);
  });

  // Update match scores
  app.post('/api/matches/score', (req, res) => {
    const { id, team, action } = req.body; // team: 'A' | 'B', action: 'inc' | 'dec'
    const match = db.matches.find(m => m.id === id);
    if (match) {
      if (team === 'A') {
        match.scoreA = Math.max(0, match.scoreA + (action === 'inc' ? 1 : -1));
      } else if (team === 'B') {
        match.scoreB = Math.max(0, match.scoreB + (action === 'inc' ? 1 : -1));
      }
      saveDB(db);
      res.json({ success: true, match });
    } else {
      res.status(404).json({ error: '경기를 찾을 수 없습니다.' });
    }
  });

  // Change status of a match
  app.post('/api/matches/status', (req, res) => {
    const { id, status } = req.body; // 'scheduled' | 'playing' | 'finished'
    const match = db.matches.find(m => m.id === id);
    if (match) {
      match.status = status;
      if (status === 'playing') {
        match.time = 'LIVE 경기중';
      } else if (status === 'finished') {
        match.time = '경기 종료';
      } else {
        match.time = new Date().toISOString().split('T')[0] + ' 예정';
      }
      saveDB(db);
      res.json({ success: true, match });
    } else {
      res.status(404).json({ error: '경기를 찾을 수 없습니다.' });
    }
  });

  // Create match
  app.post('/api/matches', (req, res) => {
    const { sport, teamA, teamB, time } = req.body;
    if (!sport || !teamA || !teamB) {
      return res.status(400).json({ error: '필수 요소가 누락되었습니다.' });
    }
    const newMatch: Match = {
      id: 'm_' + Date.now(),
      sport,
      teamA,
      teamB,
      scoreA: 0,
      scoreB: 0,
      status: 'scheduled',
      time: time || '점심시간 선발전'
    };
    db.matches.push(newMatch);
    saveDB(db);
    res.status(201).json(newMatch);
  });

  // Vite app context configuration
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Serving client files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started in ${isProd ? 'production' : 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer();
