// ─── 커뮤니티 (기획 §3.3, §6 화면 10) ─────────────────────────────
// 전체 통합 피드(지역 구분 없음). 글은 분류 태그(#SOS #info #맛집)로
// 구분하고, 상단 검색창으로 본문·번역문·작성자·태그를 검색한다.
// 언어 태그는 없다 — 무슨 언어로 쓰든 자동 번역이 처리한다.
// 사진 첨부: 앨범 업로드(캔버스 다운스케일→dataURL) 또는 데모 사진(SVG).
// 글·댓글 단위 '번역 보기'(사전 번역 페어 목업), 장소 태그 → 매장 상세.
// 위치 프라이버시: 외부에 보이는 위치 정보는 장소 태그뿐.

import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  COMMUNITY_POSTS,
  POST_TAGS,
  tagById,
  type CommunityPost,
} from '../../data/communitySeed';
import { STORES, storeById } from '../../data/seed';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useUiStore } from '../../store/useUiStore';
import { useToastStore } from '../../store/useToastStore';
import { CharacterSvg } from '../../assets/CharacterSvg';
import { CATEGORY_COLORS } from '../../assets/buildings';
import { CategoryGlyph } from '../../assets/misc';
import { DEMO_PHOTOS, PostPhotoSvg } from '../../assets/postPhotos';
import { sName, tr, useLang, useT } from '../../i18n';

function StoreTagChip({ storeId }: { storeId: number }) {
  const setTab = useUiStore((s) => s.setTab);
  const selectStore = useUiStore((s) => s.selectStore);
  const requestFlyTo = useUiStore((s) => s.requestFlyTo);
  const store = storeById(storeId);
  if (!store) return null;
  return (
    <button
      onClick={() => {
        setTab('map');
        selectStore(store.id);
        requestFlyTo({ lat: store.lat - 0.00085, lng: store.lng, zoom: 17 });
      }}
      className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-town-line bg-town-cream px-2.5 py-1 text-[11px] font-extrabold text-town-ink"
    >
      <span
        className="flex h-4.5 w-4.5 items-center justify-center rounded-md p-0.5"
        style={{ background: CATEGORY_COLORS[store.category], width: 18, height: 18 }}
      >
        <CategoryGlyph category={store.category} size={12} />
      </span>
      📍 {sName(store)}
    </button>
  );
}

/** 게시글 사진 — 업로드(dataURL)는 img, 데모 사진은 코드 SVG */
function PostPhoto({ photo, photoId }: { photo?: string; photoId?: string }) {
  if (!photo && !photoId) return null;
  return (
    <div className="mt-2.5 overflow-hidden rounded-xl border border-town-line bg-town-cream/40">
      {photo ? (
        <img src={photo} alt="첨부 사진" className="max-h-56 w-full object-cover" />
      ) : (
        <PostPhotoSvg id={photoId!} />
      )}
    </div>
  );
}

/** 글 카드에 붙는 분류 태그 칩 (탭하면 해당 태그 필터) */
function PostTagChips({ ids, onPick }: { ids: string[]; onPick: (id: string) => void }) {
  const T = useT();
  if (ids.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {ids.map((id) => {
        const tag = tagById(id);
        if (!tag) return null;
        return (
          <button
            key={id}
            onClick={() => onPick(id)}
            className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
            style={{ background: tag.color, color: tag.text }}
          >
            {T(tag.label, tag.labelEn)}
          </button>
        );
      })}
    </div>
  );
}

/** 숨겨진 다른 언어 버전 토글 — 기본 표시가 번역본이면 '원문 보기'가 된다 */
function TranslateToggle({
  other,
  otherIsOriginal,
  shown,
  onToggle,
}: {
  other: string;
  otherIsOriginal: boolean;
  shown: boolean;
  onToggle: () => void;
}) {
  const T = useT();
  return (
    <div className="mt-1.5">
      <button
        onClick={onToggle}
        className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold transition ${
          shown
            ? 'bg-town-skyDeep text-white'
            : 'border border-town-sky bg-[#EAF4F8] text-town-skyDeep'
        }`}
      >
        🌐{' '}
        {shown
          ? T('접기', 'Hide')
          : otherIsOriginal
            ? T('원문 보기', 'Show original')
            : T('번역 보기', 'Show translation')}
      </button>
      {shown && (
        <p className="fade-in mt-1.5 rounded-xl border-l-4 border-town-skyDeep bg-[#EAF4F8] px-3 py-2 text-[12.5px] leading-relaxed text-town-ink/90">
          {other}
        </p>
      )}
    </div>
  );
}

function SeedPostCard({ post, onPickTag }: { post: CommunityPost; onPickTag: (id: string) => void }) {
  const likedIds = useCommunityStore((s) => s.likedIds);
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const [showTr, setShowTr] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [trComments, setTrComments] = useState<Set<string>>(new Set());
  const T = useT();
  const lang = useLang();

  const liked = likedIds.includes(post.id);
  // 앱 언어와 일치하는 버전을 기본 표시, 토글로 반대 버전 확인.
  const primary = post.lang === lang ? post.text : post.translated;
  const other = post.lang === lang ? post.translated : post.text;
  const autoTranslated = post.lang !== lang;

  return (
    <article className="rounded-2xl border border-town-line bg-town-paper p-3.5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-town-cream text-[17px]">
          {post.flag}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13px] font-extrabold">
            {post.author}
            <span className="rounded-full bg-town-cream px-1.5 py-0.5 text-[9px] font-bold text-town-inkSoft">
              {post.nationality}
            </span>
          </p>
          <p className="text-[10px] font-bold text-town-inkSoft/70">{post.timeAgo}</p>
        </div>
      </div>

      <p className="mt-2.5 text-[13.5px] leading-relaxed text-town-ink/95">{primary}</p>
      {autoTranslated && (
        <p className="mt-0.5 text-[9.5px] font-bold text-town-skyDeep">{T('🌐 자동 번역됨', '🌐 Auto-translated')}</p>
      )}
      <PostPhoto photoId={post.photoId} />
      <PostTagChips ids={post.tags} onPick={onPickTag} />
      <TranslateToggle
        other={other}
        otherIsOriginal={autoTranslated}
        shown={showTr}
        onToggle={() => setShowTr(!showTr)}
      />
      {post.storeTagId && <StoreTagChip storeId={post.storeTagId} />}

      <div className="mt-2.5 flex items-center gap-3 border-t border-town-line/60 pt-2">
        <button
          onClick={() => toggleLike(post.id)}
          className={`flex items-center gap-1 text-[12px] font-extrabold ${
            liked ? 'text-town-coralDeep' : 'text-town-inkSoft'
          }`}
        >
          {liked ? '❤️' : '🤍'} {post.likes + (liked ? 1 : 0)}
        </button>
        {post.comments.length > 0 && (
          <button
            onClick={() => setOpenComments(!openComments)}
            className="flex items-center gap-1 text-[12px] font-extrabold text-town-inkSoft"
          >
            💬 {T(`댓글 ${post.comments.length}`, `${post.comments.length} comments`)}{' '}
            {openComments ? T('접기', 'Hide') : T('보기', 'Show')}
          </button>
        )}
      </div>

      {openComments && (
        <ul className="fade-in mt-2 flex flex-col gap-2">
          {post.comments.map((c) => {
            const shown = trComments.has(c.id);
            const cPrimary = c.lang === lang ? c.text : c.translated;
            const cOther = c.lang === lang ? c.translated : c.text;
            return (
              <li key={c.id} className="rounded-xl bg-town-cream/70 p-2.5">
                <p className="text-[11.5px] font-extrabold">
                  {c.flag} {c.author}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-town-ink/90">{cPrimary}</p>
                <TranslateToggle
                  other={cOther}
                  otherIsOriginal={c.lang !== lang}
                  shown={shown}
                  onToggle={() =>
                    setTrComments((prev) => {
                      const next = new Set(prev);
                      if (next.has(c.id)) next.delete(c.id);
                      else next.add(c.id);
                      return next;
                    })
                  }
                />
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

/** 태그 라벨 매칭 — 한/영 라벨 모두 본다 */
function tagMatches(needle: string, tagId: string): boolean {
  const tag = tagById(tagId);
  if (!tag) return false;
  return tag.label.toLowerCase().includes(needle) || tag.labelEn.toLowerCase().includes(needle);
}

/** 검색어가 글에 걸리는지 — 본문·번역문·작성자·태그 라벨·댓글까지 본다 */
function postMatches(q: string, post: CommunityPost): boolean {
  const needle = q.toLowerCase();
  if (post.text.toLowerCase().includes(needle)) return true;
  if (post.translated.toLowerCase().includes(needle)) return true;
  if (post.author.toLowerCase().includes(needle)) return true;
  if (post.tags.some((id) => tagMatches(needle, id))) return true;
  return post.comments.some(
    (c) => c.text.toLowerCase().includes(needle) || c.author.toLowerCase().includes(needle),
  );
}

export function CommunityScreen() {
  const profile = useProfileStore((s) => s.profile);
  const myPosts = useCommunityStore((s) => s.myPosts);
  const addPost = useCommunityStore((s) => s.addPost);
  const toast = useToastStore((s) => s.show);
  const T = useT();

  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | 'all'>('all');
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [draftStore, setDraftStore] = useState<number | 0>(0);
  const [draftPhoto, setDraftPhoto] = useState<string | null>(null); // 업로드 dataURL
  const [draftPhotoId, setDraftPhotoId] = useState<string | null>(null); // 데모 사진 id
  const fileRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();

  const filteredSeed = useMemo(
    () =>
      COMMUNITY_POSTS.filter((p) => tagFilter === 'all' || p.tags.includes(tagFilter)).filter(
        (p) => q === '' || postMatches(q, p),
      ),
    [tagFilter, q],
  );

  const filteredMine = useMemo(
    () =>
      myPosts
        .filter((p) => tagFilter === 'all' || p.tags.includes(tagFilter))
        .filter(
          (p) => q === '' || p.text.toLowerCase().includes(q) || p.tags.some((id) => tagMatches(q, id)),
        ),
    [myPosts, tagFilter, q],
  );

  /** 앨범 사진 → 960px 이하 JPEG dataURL 로 다운스케일 (localStorage 용량 보호) */
  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    const fail = () => {
      URL.revokeObjectURL(url);
      toast(tr('사진을 불러오지 못했어요', 'Could not load that photo'), 'error');
    };
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const max = 960;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('2D canvas unavailable');
        ctx.fillStyle = '#fff'; // PNG 투명 배경 → JPEG 흰 배경
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        setDraftPhoto(canvas.toDataURL('image/jpeg', 0.78));
        setDraftPhotoId(null);
      } catch {
        fail();
      }
    };
    img.onerror = fail;
    img.src = url;
  };

  const submit = () => {
    if (draft.trim().length < 2) return;
    addPost(draft.trim(), draftTags, {
      storeTagId: draftStore || undefined,
      photo: draftPhoto ?? undefined,
      photoId: draftPhotoId ?? undefined,
    });
    setDraft('');
    setDraftTags([]);
    setDraftStore(0);
    setDraftPhoto(null);
    setDraftPhotoId(null);
    setComposing(false);
    toast(tr('커뮤니티에 글을 올렸어요!', 'Posted to the community!'), 'success');
  };

  const toggleDraftTag = (id: string) =>
    setDraftTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const total = filteredSeed.length + filteredMine.length;

  return (
    <div className="flex h-full flex-col bg-town-cream">
      <header className="px-5 pb-2 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-extrabold">{T('커뮤니티', 'Community')}</h2>
            <p className="text-[11.5px] font-bold text-town-inkSoft">
              {T('🌏 전체 주민 통합 채널 · 내 위치는 노출되지 않아요', '🌏 All-residents channel · your location stays private')}
            </p>
          </div>
          <span className="rounded-full bg-town-leaf/15 px-2.5 py-1 text-[10.5px] font-extrabold text-town-leafDark">
            {T(`주민 ${COMMUNITY_POSTS.length + myPosts.length + 40}명`, `${COMMUNITY_POSTS.length + myPosts.length + 40} residents`)}
          </span>
        </div>

        {/* 글 검색 */}
        <div className="mt-2.5 flex items-center gap-2 rounded-2xl border-2 border-town-line bg-town-paper px-3 py-2">
          <span className="text-[13px]">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={T('글·작성자·태그 검색', 'Search posts, authors, tags')}
            className="min-w-0 flex-1 bg-transparent text-[13px] font-bold outline-none placeholder:text-town-inkSoft/50"
            aria-label="커뮤니티 글 검색"
          />
          {query !== '' && (
            <button
              onClick={() => setQuery('')}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-town-cream text-[10px] font-bold text-town-inkSoft"
              aria-label="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>

        {/* 태그 필터 칩 */}
        <div className="no-scrollbar mt-2 flex gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setTagFilter('all')}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-extrabold transition ${
              tagFilter === 'all'
                ? 'bg-town-ink text-town-paper'
                : 'border border-town-line bg-town-paper text-town-inkSoft'
            }`}
          >
            {T('전체', 'All')}
          </button>
          {POST_TAGS.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setTagFilter(tagFilter === tag.id ? 'all' : tag.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-extrabold transition ${
                tagFilter === tag.id ? 'ring-2 ring-town-ink/60' : 'border border-transparent'
              }`}
              style={{ background: tag.color, color: tag.text }}
            >
              {T(tag.label, tag.labelEn)}
            </button>
          ))}
        </div>
      </header>

      <div className="no-scrollbar flex-1 space-y-2.5 overflow-y-auto px-4 pb-28 pt-1">
        {/* 검색/필터 결과 요약 */}
        {(q !== '' || tagFilter !== 'all') && (
          <p className="px-1 text-[11px] font-extrabold text-town-inkSoft">
            {q !== '' && (
              <>
                ‘<span className="text-town-ink">{query.trim()}</span>’ {T('검색', 'search')} ·{' '}
              </>
            )}
            {tagFilter !== 'all' && (
              <>
                {(() => {
                  const tag = tagById(tagFilter);
                  return tag ? T(tag.label, tag.labelEn) : null;
                })()}{' '}
                ·{' '}
              </>
            )}
            {T(`글 ${total}건`, `${total} posts`)}
          </p>
        )}

        {/* 내가 쓴 글 */}
        {filteredMine.map((p) => (
          <article key={p.id} className="rounded-2xl border-2 border-town-leaf/40 bg-town-leaf/5 p-3.5">
            <div className="flex items-center gap-2">
              {profile && (
                <span className="inline-block overflow-hidden rounded-full border border-town-line bg-[#EAF6EF]">
                  <CharacterSvg config={profile.character} size={34} bust shadow={false} />
                </span>
              )}
              <div>
                <p className="flex items-center gap-1.5 text-[13px] font-extrabold">
                  {profile?.nickname}
                  <span className="rounded-full bg-town-leafDark px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                    {T('나', 'Me')}
                  </span>
                </p>
                <p className="text-[10px] font-bold text-town-inkSoft/70">{T('방금', 'Just now')}</p>
              </div>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-relaxed">{p.text}</p>
            <PostPhoto photo={p.photo} photoId={p.photoId} />
            <PostTagChips ids={p.tags} onPick={(id) => setTagFilter(id)} />
            {p.storeTagId && <StoreTagChip storeId={p.storeTagId} />}
          </article>
        ))}

        {filteredSeed.map((post) => (
          <SeedPostCard key={post.id} post={post} onPickTag={(id) => setTagFilter(id)} />
        ))}

        {total === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-town-line bg-town-paper/70 p-6 text-center">
            <p className="text-[20px]">🔍</p>
            <p className="mt-1 text-[13px] font-extrabold">{T('검색 결과가 없어요', 'No results')}</p>
            <p className="mt-0.5 text-[11.5px] font-bold text-town-inkSoft">
              {T('다른 검색어나 태그로 다시 찾아보세요', 'Try a different keyword or tag')}
            </p>
          </div>
        )}
      </div>

      {/* 글 작성 FAB */}
      <button
        onClick={() => setComposing(true)}
        className="absolute bottom-24 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-town-leafDark text-[22px] text-white shadow-card transition active:scale-95"
        aria-label="글 작성"
      >
        ✏️
      </button>

      {/* 작성 시트 */}
      {composing && (
        <div className="absolute inset-0 z-[860] flex flex-col justify-end bg-town-ink/40 pb-16 fade-in">
          <div className="sheet-up rounded-[1.6rem] bg-town-paper p-5 pb-6 shadow-sheet mx-2 mb-1">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold">{T('커뮤니티에 글쓰기', 'Write a Post')}</h3>
              <button
                onClick={() => setComposing(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-town-cream text-[13px] font-bold text-town-inkSoft"
                aria-label="작성 닫기"
              >
                ✕
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 300))}
              placeholder={T('주민들과 나누고 싶은 이야기를 적어보세요 (2자 이상)', 'Share something with fellow residents (2+ chars)')}
              rows={4}
              autoFocus
              className="w-full resize-none rounded-2xl border-2 border-town-line bg-town-cream/50 p-3.5 text-[14px] font-medium outline-none focus:border-town-leaf"
            />

            {/* 분류 태그 선택 */}
            <div className="mt-2.5">
              <p className="mb-1.5 text-[12px] font-extrabold text-town-inkSoft">{T('태그 선택', 'Pick tags')}</p>
              <div className="flex flex-wrap gap-1.5">
                {POST_TAGS.map((tag) => {
                  const on = draftTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => toggleDraftTag(tag.id)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold transition ${
                        on ? 'ring-2 ring-town-ink/60' : 'opacity-70'
                      }`}
                      style={{ background: tag.color, color: tag.text }}
                    >
                      {T(tag.label, tag.labelEn)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 사진 첨부 — 앨범 업로드(자동 축소) 또는 데모 사진 */}
            <div className="mt-2.5">
              <p className="mb-1.5 text-[12px] font-extrabold text-town-inkSoft">{T('사진 첨부', 'Attach a photo')}</p>
              {draftPhoto || draftPhotoId ? (
                <div className="relative w-fit">
                  <div className="w-[172px] overflow-hidden rounded-xl border border-town-line bg-town-cream/40">
                    {draftPhoto ? (
                      <img src={draftPhoto} alt="첨부할 사진" className="h-24 w-full object-cover" />
                    ) : (
                      <PostPhotoSvg id={draftPhotoId!} />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setDraftPhoto(null);
                      setDraftPhotoId(null);
                    }}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-town-ink text-[10px] font-bold text-white shadow-sm"
                    aria-label="사진 제거"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="rounded-full border border-town-skyDeep bg-[#EAF4F8] px-2.5 py-1 text-[11px] font-extrabold text-town-skyDeep"
                  >
                    {T('📷 앨범에서 선택', '📷 From album')}
                  </button>
                  {DEMO_PHOTOS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setDraftPhotoId(p.id);
                        setDraftPhoto(null);
                      }}
                      className="rounded-full border border-town-line bg-town-cream px-2.5 py-1 text-[11px] font-extrabold text-town-inkSoft"
                    >
                      🖼️ {T(p.label, p.labelEn)}
                    </button>
                  ))}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="hidden"
                aria-label="사진 파일 선택"
              />
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="shrink-0 text-[12px] font-extrabold text-town-inkSoft">{T('장소 태그', 'Place tag')}</span>
              <select
                value={draftStore}
                onChange={(e) => setDraftStore(Number(e.target.value))}
                className="min-w-0 flex-1 rounded-xl border border-town-line bg-town-cream px-2 py-2 text-[12.5px] font-bold outline-none"
                aria-label="장소 태그 선택"
              >
                <option value={0}>{T('태그 없음', 'No tag')}</option>
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    📍 {sName(s)}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={submit}
              disabled={draft.trim().length < 2}
              className="mt-3.5 w-full rounded-2xl bg-town-leafDark py-3.5 text-[15px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none disabled:bg-town-line disabled:text-town-inkSoft/50 disabled:shadow-none"
            >
              {T('올리기', 'Post')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
