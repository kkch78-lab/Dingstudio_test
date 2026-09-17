import { Post, RentalItem, MatchItem } from '../types';

export const INITIAL_ANNOUNCEMENTS: string[] = [
  '🏆 [체육대회] 2026 원더풀 스포츠 페스티벌 세부 종목 및 배점 가이드 개정 배포 완료!',
  '⚽ [오아시스] 2교시 쉬는 시간 3학년 축구 결상 매치 - 3반 vs 6반 정오 13시 킥오프!',
  '📌 [학생심판지원단(기자단)] 금일 점심시간 경기 담당 학생 심판진 전원 12:40분 체육부실 소집 요망.',
  '🔬 [연구학교] 생체신호 모니터링 스마트 디바이스 1학년 2반 시범 체육 수업 진행 중'
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    category: '자유',
    title: '2026학년도 1학기 자율 체육 활동 안내 및 오아시스 시간 운영 수칙',
    author: '체육교육부',
    content: `원곡중학교 학생 여러분 안녕하세요!\n\n2026학년도 1학기 아침 및 점심시간 자율 체육 활동(오아시스 스포츠)에 대한 운영 안내입니다.\n\n1. 운영 시간\n- 아침 오아시스: 매일 08:10 ~ 08:45\n- 점심 오아시스: 매일 12:50 ~ 13:30\n\n2. 이용 가능 시설\n- 대운동장(축구 및 육상 트랙)\n- 강당(배드민턴, 농구 - 요일별 학년 순환 배정)\n\n3. 안전 및 페어플레이 수칙\n- 반드시 준비운동 후 활동에 참여합니다.\n- 장비 사용 후 체육기자재실에 원상복구 반납을 철저히 진행합니다.`,
    date: '2026-08-28',
    views: 142,
    fileUrl: '2026_원곡중_자율체육_운영안내서.hwp'
  },
  {
    id: 'post-2',
    category: '스포츠클럽',
    title: '학교스포츠클럽 축구·피구 주말 리그전 3월 대진표 및 참가 신청',
    author: '스포츠클럽지원단',
    content: `원곡중학교 학교스포츠클럽 주말 리그전이 시작됩니다!\n\n각 학급 대표 및 동아리 부원들은 학급별 엔트리를 확인하고 정해진 기한 내에 대진표 등록을 완료해 주세요.\n\n- 대상: 1~3학년 희망 학급 및 자율 스포츠 동아리\n- 종목: 풋살(남), 피구(여/혼성), 농구 3x3\n- 리그 장소: 원곡중학교 대운동장 및 실내체육관`,
    date: '2026-08-29',
    views: 98,
    fileUrl: '2026_주말스포츠클럽_대진표_서식.pdf'
  },
  {
    id: 'post-3',
    category: '학생체육지원단',
    title: '2026 원더풀 스포츠 페스티벌 (체육대회) 학생지원단 2차 워크숍 공지',
    author: '학생체육회',
    content: `올해 원곡 원더풀 체육대회는 학생들이 직접 기획하고 운영하는 100% 학생 주도형 페스티벌로 개최됩니다.\n\n각 반 체육부장 및 학생체육지원단 위원들은 2차 기획안 회의에 필히 참석해 주시기 바랍니다.\n\n- 일시: 금주 목요일 방과후 15:40\n- 장소: 2층 지혜관 회의실\n- 안건: 반별 응원전 채점 기준 및 신규 e스포츠 종목 시범 도입안 심의`,
    date: '2026-08-30',
    views: 215
  },
  {
    id: 'post-4',
    category: '내가 바로 원곡 릴스꾼',
    title: '⚡ [릴스왕 챌린지] 3학년 2반 체육시간 점프슛 & 슬로우모션 숏폼!',
    author: '3학년 김원곡',
    content: `체육시간 농구 수업 중 친구들과 함께 촬영한 멋진 3점슛 릴스입니다!\n\n다들 체육시간에 열정적으로 땀흘리고 함께 웃는 모습이 너무 멋져서 올려봅니다. 원곡 릴스꾼 1등 가자! 🔥`,
    date: '2026-08-30',
    views: 340
  },
  {
    id: 'post-5',
    category: '학생심판지원단(기자단)',
    title: '공정하고 정의로운 경기! 2026 학생심판단 공식 판정 가이드북 배포',
    author: '학생심판위원장',
    content: `우리 원곡중학교는 학생 스스로 심판을 보고 경기를 운영하는 자랑스러운 자치 문화를 가지고 있습니다.\n\n심판진의 수신호 표준화 및 반칙/파울 규정을 일목요연하게 정리한 가이드북을 배포하오니, 심판단뿐만 아니라 모든 참가 학생들도 숙지해 주시기 바랍니다.\n\n"존중과 신뢰가 있을 때 비로소 진정한 스포츠가 완성됩니다!"`,
    date: '2026-08-30',
    views: 187,
    fileUrl: '학생심판단_공식_판정_핸드북_2026.pdf'
  }
];

export const INITIAL_RENTALS: RentalItem[] = [
  {
    id: 'rent-1',
    name: '축구공 (스타 매치 5호구)',
    category: '구기종목',
    total: 12,
    rented: 4,
    renter: '3학년 3반 이원곡',
    classRoom: '점심시간 축구 연습'
  },
  {
    id: 'rent-2',
    name: '농구공 (몰텐 BG3800)',
    category: '구기종목',
    total: 10,
    rented: 2,
    renter: '2학년 5반 박스포츠',
    classRoom: '방과후 농구반'
  },
  {
    id: 'rent-3',
    name: '배드민턴 라켓 & 셔틀콕 세트',
    category: '라켓종목',
    total: 16,
    rented: 6,
    renter: '1학년 1반 최체육',
    classRoom: '아침 오아시스'
  },
  {
    id: 'rent-4',
    name: '소프트 안전 피구공',
    category: '구기종목',
    total: 8,
    rented: 1,
    renter: '2학년 4반 정하모니',
    classRoom: '학급 자율 피구'
  },
  {
    id: 'rent-5',
    name: '형광 팀 조끼 (노랑/형광핑크)',
    category: '보조용품',
    total: 30,
    rented: 14,
    renter: '학생심판단',
    classRoom: '오아시스 점심 매치'
  },
  {
    id: 'rent-6',
    name: '스마트 스피드 줄넘기',
    category: '체력단련',
    total: 20,
    rented: 5,
    renter: '1학년 3반 강건강',
    classRoom: '체력증진 챌린지'
  }
];

export const INITIAL_MATCHES: MatchItem[] = [
  {
    id: 'match-1',
    sport: '축구',
    teamA: '3학년 3반 (FC원곡)',
    teamB: '3학년 6반 (유나이티드)',
    time: '점심시간 13:00 (대운동장)',
    scoreA: 2,
    scoreB: 1,
    status: 'live'
  },
  {
    id: 'match-2',
    sport: '피구',
    teamA: '2학년 1반 (불꽃슈터)',
    teamB: '2학년 4반 (스피릿)',
    time: '점심시간 12:40 (체육관 A)',
    scoreA: 0,
    scoreB: 0,
    status: 'scheduled'
  },
  {
    id: 'match-3',
    sport: '농구',
    teamA: '1학년 A조 연합팀',
    teamB: '1학년 B조 연합팀',
    time: '방과후 16:00 (체육관 B)',
    scoreA: 18,
    scoreB: 16,
    status: 'finished'
  }
];
