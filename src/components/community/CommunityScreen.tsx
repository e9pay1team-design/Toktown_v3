// ─── 커뮤니티 (기획 §3.3, §6 화면 10) ─────────────────────────────
// 전체 통합 피드(지역 구분 없음). 글은 분류 태그(#도움요청 #동네정보 …)로
// 구분하고, 상단 검색창으로 본문·번역문·작성자·태그를 검색한다.
// 글·댓글 단위 '번역 보기'(사전 번역 페어 목업), 장소 태그 → 매장 상세.
// 위치 프라이버시: 외부에 보이는 위치 정보는 장소 태그뿐.

import { useMemo, useState } from 'react';
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
      📍 {store.name}
    </button>
  );
}

/** 글 카드에 붙는 분류 태그 칩 (탭하면 해당 태그 필터) */
function PostTagChips({ ids, onPick }: { ids: string[]; onPick: (id: string) => void }) {
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
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}

function TranslateToggle({
  translated,
  shown,
  onToggle,
}: {
  translated: string;
  shown: boolean;
  onToggle: () => void;
}) {
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
        🌐 {shown ? '원문 보기' : '번역 보기'}
      </button>
      {shown && (
        <p className="fade-in mt-1.5 rounded-xl border-l-4 border-town-skyDeep bg-[#EAF4F8] px-3 py-2 text-[12.5px] leading-relaxed text-town-ink/90">
          {translated}
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

  const liked = likedIds.includes(post.id);

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

      <p className="mt-2.5 text-[13.5px] leading-relaxed text-town-ink/95">{post.text}</p>
      <PostTagChips ids={post.tags} onPick={onPickTag} />
      <TranslateToggle
        translated={post.translated}
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
            💬 댓글 {post.comments.length} {openComments ? '접기' : '보기'}
          </button>
        )}
      </div>

      {openComments && (
        <ul className="fade-in mt-2 flex flex-col gap-2">
          {post.comments.map((c) => {
            const shown = trComments.has(c.id);
            return (
              <li key={c.id} className="rounded-xl bg-town-cream/70 p-2.5">
                <p className="text-[11.5px] font-extrabold">
                  {c.flag} {c.author}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-town-ink/90">{c.text}</p>
                <TranslateToggle
                  translated={c.translated}
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

/** 검색어가 글에 걸리는지 — 본문·번역문·작성자·태그 라벨·댓글까지 본다 */
function postMatches(q: string, post: CommunityPost): boolean {
  const needle = q.toLowerCase();
  if (post.text.toLowerCase().includes(needle)) return true;
  if (post.translated.toLowerCase().includes(needle)) return true;
  if (post.author.toLowerCase().includes(needle)) return true;
  if (post.tags.some((id) => tagById(id)?.label.toLowerCase().includes(needle))) return true;
  return post.comments.some(
    (c) => c.text.toLowerCase().includes(needle) || c.author.toLowerCase().includes(needle),
  );
}

export function CommunityScreen() {
  const profile = useProfileStore((s) => s.profile);
  const myPosts = useCommunityStore((s) => s.myPosts);
  const addPost = useCommunityStore((s) => s.addPost);
  const toast = useToastStore((s) => s.show);

  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState<string | 'all'>('all');
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState('');
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [draftStore, setDraftStore] = useState<number | 0>(0);

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
          (p) =>
            q === '' ||
            p.text.toLowerCase().includes(q) ||
            p.tags.some((id) => tagById(id)?.label.toLowerCase().includes(q)),
        ),
    [myPosts, tagFilter, q],
  );

  const submit = () => {
    if (draft.trim().length < 2) return;
    addPost(draft.trim(), draftTags, draftStore || undefined);
    setDraft('');
    setDraftTags([]);
    setDraftStore(0);
    setComposing(false);
    toast('커뮤니티에 글을 올렸어요!', 'success');
  };

  const toggleDraftTag = (id: string) =>
    setDraftTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));

  const total = filteredSeed.length + filteredMine.length;

  return (
    <div className="flex h-full flex-col bg-town-cream">
      <header className="px-5 pb-2 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-extrabold">커뮤니티</h2>
            <p className="text-[11.5px] font-bold text-town-inkSoft">
              🌏 전체 주민 통합 채널 · 내 위치는 노출되지 않아요
            </p>
          </div>
          <span className="rounded-full bg-town-leaf/15 px-2.5 py-1 text-[10.5px] font-extrabold text-town-leafDark">
            주민 {COMMUNITY_POSTS.length + myPosts.length + 40}명
          </span>
        </div>

        {/* 글 검색 */}
        <div className="mt-2.5 flex items-center gap-2 rounded-2xl border-2 border-town-line bg-town-paper px-3 py-2">
          <span className="text-[13px]">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="글·작성자·태그 검색"
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
            전체
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
              {tag.label}
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
                ‘<span className="text-town-ink">{query.trim()}</span>’ 검색 ·{' '}
              </>
            )}
            {tagFilter !== 'all' && <>{tagById(tagFilter)?.label} · </>}글 {total}건
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
                    나
                  </span>
                </p>
                <p className="text-[10px] font-bold text-town-inkSoft/70">방금</p>
              </div>
            </div>
            <p className="mt-2.5 text-[13.5px] leading-relaxed">{p.text}</p>
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
            <p className="mt-1 text-[13px] font-extrabold">검색 결과가 없어요</p>
            <p className="mt-0.5 text-[11.5px] font-bold text-town-inkSoft">
              다른 검색어나 태그로 다시 찾아보세요
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
              <h3 className="text-[16px] font-extrabold">커뮤니티에 글쓰기</h3>
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
              placeholder="주민들과 나누고 싶은 이야기를 적어보세요 (2자 이상)"
              rows={4}
              autoFocus
              className="w-full resize-none rounded-2xl border-2 border-town-line bg-town-cream/50 p-3.5 text-[14px] font-medium outline-none focus:border-town-leaf"
            />

            {/* 분류 태그 선택 */}
            <div className="mt-2.5">
              <p className="mb-1.5 text-[12px] font-extrabold text-town-inkSoft">태그 선택</p>
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
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="shrink-0 text-[12px] font-extrabold text-town-inkSoft">장소 태그</span>
              <select
                value={draftStore}
                onChange={(e) => setDraftStore(Number(e.target.value))}
                className="min-w-0 flex-1 rounded-xl border border-town-line bg-town-cream px-2 py-2 text-[12.5px] font-bold outline-none"
                aria-label="장소 태그 선택"
              >
                <option value={0}>태그 없음</option>
                {STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    📍 {s.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={submit}
              disabled={draft.trim().length < 2}
              className="mt-3.5 w-full rounded-2xl bg-town-leafDark py-3.5 text-[15px] font-extrabold text-white shadow-pop transition active:translate-y-[2px] active:shadow-none disabled:bg-town-line disabled:text-town-inkSoft/50 disabled:shadow-none"
            >
              올리기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
