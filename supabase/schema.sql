-- =====================================================================
-- 센터 계정(B) — Supabase 데이터베이스 설정 (세 프로그램 공통, 한 번만)
--   프로그램 서포터 · 6대 의무교육 도우미 · 차량 지킴이가 같은 프로젝트를 함께 씁니다.
--   Supabase 대시보드 → SQL Editor → New query → 이 파일 전체 붙여 넣기 → Run
--   여러 번 실행해도 괜찮습니다(이미 있는 것은 건너뜀).
--
--   지키는 것
--   1) 같은 센터 선생님만 그 센터 기록을 봄 (RLS: 행 단위 보안)
--   2) 센터에 들어오려면 센터장이 알려 준 초대 코드가 필요. 틀린 코드는 15분에 10번까지
--   3) 기록은 지우지 않고 '지운 표시(value = null)'로 남겨 다른 컴퓨터에도 지운 것이 전달됨
--   4) 누가 언제 무엇을 고쳤는지 center_history에 자동으로 남음
--   5) 아동 사진은 서버에 올리지 않음 (프로그램이 사진을 보내지 않도록 만들어져 있음)
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------- 표 ----------
create table if not exists public.centers (
  id              uuid primary key default gen_random_uuid(),
  name            text not null check (char_length(btrim(name)) between 1 and 60),
  invite_code     text not null unique,
  privacy_ack_at  timestamptz not null,           -- 센터장이 개인정보·보호자 동의 안내를 확인한 때
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table if not exists public.center_members (
  center_id     uuid not null references public.centers(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'teacher' check (role in ('owner', 'teacher')),
  display_name  text not null default '' check (char_length(display_name) <= 30),
  joined_at     timestamptz not null default now(),
  primary key (center_id, user_id)
);
create index if not exists center_members_user_idx on public.center_members (user_id);

create table if not exists public.center_data (
  center_id     uuid not null references public.centers(id) on delete cascade,
  app           text not null check (app in ('program-supporter', 'edu-safety-helper', 'chajikimi')),
  key           text not null check (char_length(key) between 1 and 200),
  value         jsonb,                              -- null = 지운 기록
  updated_at    timestamptz not null default now(),
  updated_by    uuid,
  updated_name  text,
  primary key (center_id, app, key),
  constraint center_data_size check (value is null or octet_length(value::text) <= 2000000)
);
create index if not exists center_data_since_idx on public.center_data (center_id, app, updated_at);

create table if not exists public.center_history (
  id         bigint generated always as identity primary key,
  center_id  uuid not null references public.centers(id) on delete cascade,
  app        text not null,
  key        text not null,
  action     text not null,                        -- 추가 · 수정 · 삭제
  by_user    uuid,
  by_name    text,
  at         timestamptz not null default now()
);
create index if not exists center_history_idx on public.center_history (center_id, at desc);

create table if not exists public.join_attempts (
  user_id  uuid not null,
  at       timestamptz not null default now()
);
create index if not exists join_attempts_idx on public.join_attempts (user_id, at);

-- ---------- 도우미 함수 (security definer: RLS 안에서 자기 자신을 다시 부르지 않게) ----------
create or replace function public.is_member(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.center_members m where m.center_id = c and m.user_id = auth.uid());
$$;

create or replace function public.is_owner(c uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.center_members m where m.center_id = c and m.user_id = auth.uid() and m.role = 'owner');
$$;

create or replace function public.new_invite_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  abc constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';  -- 헷갈리는 0·O·1·I는 뺌
  code text;
  b bytea;
begin
  loop
    b := gen_random_bytes(8);
    code := '';
    for i in 0..7 loop
      code := code || substr(abc, (get_byte(b, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.centers where invite_code = code);
  end loop;
  return code;
end $$;

-- ---------- 기록이 바뀔 때: 시간·사람을 서버가 적고, 변경 기록을 남김 ----------
create or replace function public.center_data_stamp() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := clock_timestamp();
  new.updated_by := auth.uid();
  new.updated_name := (select display_name from public.center_members
                        where center_id = new.center_id and user_id = auth.uid());
  return new;
end $$;

create or replace function public.center_data_log() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and old.value is not distinct from new.value then
    return null;  -- 내용이 같으면 기록하지 않음
  end if;
  insert into public.center_history (center_id, app, key, action, by_user, by_name)
  values (new.center_id, new.app, new.key,
          case when new.value is null then '삭제'
               when tg_op = 'INSERT' or old.value is null then '추가'
               else '수정' end,
          new.updated_by, new.updated_name);
  -- 오래된 변경 기록은 1년만 보관
  delete from public.center_history where center_id = new.center_id and at < now() - interval '365 days';
  return null;
end $$;

drop trigger if exists center_data_stamp on public.center_data;
create trigger center_data_stamp before insert or update on public.center_data
  for each row execute function public.center_data_stamp();
drop trigger if exists center_data_log on public.center_data;
create trigger center_data_log after insert or update on public.center_data
  for each row execute function public.center_data_log();

-- ---------- 행 단위 보안 (RLS) ----------
alter table public.centers        enable row level security;
alter table public.center_members enable row level security;
alter table public.center_data    enable row level security;
alter table public.center_history enable row level security;
alter table public.join_attempts  enable row level security;   -- 정책 없음 = 함수로만 씀

-- 로그인하지 않은 사람(anon)은 아무것도 못 함
revoke all on public.centers, public.center_members, public.center_data, public.center_history, public.join_attempts from anon;
-- 로그인한 사람도 표는 정해진 만큼만 (센터 만들기·들어가기는 아래 함수로만)
revoke all on public.centers, public.center_members, public.center_history, public.join_attempts from authenticated;
revoke all on public.center_data from authenticated;
grant select on public.centers, public.center_members, public.center_history to authenticated;
grant select, insert, update on public.center_data to authenticated;   -- delete 없음 (지운 표시로만)

drop policy if exists centers_read on public.centers;
create policy centers_read on public.centers for select to authenticated using (public.is_member(id));

drop policy if exists members_read on public.center_members;
create policy members_read on public.center_members for select to authenticated using (public.is_member(center_id));

drop policy if exists data_read on public.center_data;
create policy data_read on public.center_data for select to authenticated using (public.is_member(center_id));
drop policy if exists data_insert on public.center_data;
create policy data_insert on public.center_data for insert to authenticated with check (public.is_member(center_id));
drop policy if exists data_update on public.center_data;
create policy data_update on public.center_data for update to authenticated
  using (public.is_member(center_id)) with check (public.is_member(center_id));

drop policy if exists history_read on public.center_history;
create policy history_read on public.center_history for select to authenticated using (public.is_member(center_id));

-- ---------- 프로그램이 부르는 함수 ----------
-- 내 센터 목록
create or replace function public.my_centers()
returns table (id uuid, name text, invite_code text, role text, display_name text)
language sql stable security definer set search_path = public as $$
  select c.id, c.name, c.invite_code, m.role, m.display_name
    from public.center_members m join public.centers c on c.id = m.center_id
   where m.user_id = auth.uid()
   order by m.joined_at;
$$;

-- 센터 만들기 (만든 사람 = 센터장)
create or replace function public.create_center(p_name text, p_display_name text, p_privacy_ack boolean)
returns table (id uuid, name text, invite_code text, role text, display_name text)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare c public.centers;
begin
  if auth.uid() is null then raise exception '로그인이 필요해요' using errcode = '28000'; end if;
  if coalesce(p_privacy_ack, false) is false then
    raise exception '개인정보 안내를 확인해 주세요' using errcode = '22023';
  end if;
  if (select count(*) from public.center_members where user_id = auth.uid() and role = 'owner') >= 3 then
    raise exception '센터는 한 사람이 3개까지 만들 수 있어요' using errcode = '22023';
  end if;
  insert into public.centers (name, invite_code, privacy_ack_at, created_by)
  values (btrim(p_name), public.new_invite_code(), now(), auth.uid())
  returning * into c;
  insert into public.center_members (center_id, user_id, role, display_name)
  values (c.id, auth.uid(), 'owner', left(btrim(coalesce(p_display_name, '')), 30));
  return query select c.id, c.name, c.invite_code, 'owner'::text, left(btrim(coalesce(p_display_name, '')), 30);
end $$;

-- 초대 코드로 들어가기 (틀린 코드는 15분에 10번까지)
create or replace function public.join_center(p_code text, p_display_name text)
returns table (id uuid, name text, invite_code text, role text, display_name text)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare c public.centers; tries int;
begin
  if auth.uid() is null then raise exception '로그인이 필요해요' using errcode = '28000'; end if;
  delete from public.join_attempts where at < now() - interval '1 day';
  select count(*) into tries from public.join_attempts
   where user_id = auth.uid() and at > now() - interval '15 minutes';
  if tries >= 10 then
    raise exception '여러 번 틀려서 15분 동안 잠겼어요' using errcode = '22023';
  end if;
  select * into c from public.centers where invite_code = upper(btrim(p_code));
  if not found then
    insert into public.join_attempts (user_id) values (auth.uid());
    raise exception '초대 코드가 맞지 않아요' using errcode = '22023';
  end if;
  insert into public.center_members (center_id, user_id, role, display_name)
  values (c.id, auth.uid(), 'teacher', left(btrim(coalesce(p_display_name, '')), 30))
  on conflict (center_id, user_id) do update set display_name = excluded.display_name;
  return query select m.center_id, c.name, c.invite_code, m.role, m.display_name
                 from public.center_members m where m.center_id = c.id and m.user_id = auth.uid();
end $$;

-- 센터 선생님 목록
create or replace function public.center_people(p_center uuid)
returns table (user_id uuid, role text, display_name text, joined_at timestamptz, is_me boolean)
language sql stable security definer set search_path = public as $$
  select m.user_id, m.role, m.display_name, m.joined_at, m.user_id = auth.uid()
    from public.center_members m
   where m.center_id = p_center and public.is_member(p_center)
   order by (m.role = 'owner') desc, m.joined_at;
$$;

-- 최근 변경 기록
create or replace function public.center_recent(p_center uuid, p_app text, p_limit int default 30)
returns table (key text, action text, by_name text, at timestamptz)
language sql stable security definer set search_path = public as $$
  select h.key, h.action, h.by_name, h.at
    from public.center_history h
   where h.center_id = p_center and (p_app is null or h.app = p_app) and public.is_member(p_center)
   order by h.at desc
   limit least(greatest(coalesce(p_limit, 30), 1), 100);
$$;

-- 내 이름 바꾸기
create or replace function public.set_my_name(p_center uuid, p_display_name text)
returns void language sql security definer set search_path = public as $$
  update public.center_members set display_name = left(btrim(coalesce(p_display_name, '')), 30)
   where center_id = p_center and user_id = auth.uid();
$$;

-- 초대 코드 새로 만들기 (센터장만) — 그만둔 선생님이 예전 코드로 못 들어오게
create or replace function public.rotate_invite(p_center uuid)
returns text language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not public.is_owner(p_center) then raise exception '센터장만 할 수 있어요' using errcode = '42501'; end if;
  code := public.new_invite_code();
  update public.centers set invite_code = code where id = p_center;
  return code;
end $$;

-- 선생님 내보내기 (센터장만, 자기 자신은 안 됨)
create or replace function public.remove_member(p_center uuid, p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner(p_center) then raise exception '센터장만 할 수 있어요' using errcode = '42501'; end if;
  if p_user = auth.uid() then raise exception '센터장 자신은 내보낼 수 없어요' using errcode = '22023'; end if;
  delete from public.center_members where center_id = p_center and user_id = p_user;
end $$;

-- 센터에서 나가기 (센터장은 다른 센터장을 정하기 전에는 못 나감)
create or replace function public.leave_center(p_center uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if public.is_owner(p_center) then raise exception '센터장은 나갈 수 없어요' using errcode = '22023'; end if;
  delete from public.center_members where center_id = p_center and user_id = auth.uid();
end $$;

-- 함수 실행 권한: 로그인한 사람만
revoke execute on function public.my_centers(), public.create_center(text, text, boolean), public.join_center(text, text),
  public.center_people(uuid), public.center_recent(uuid, text, int), public.set_my_name(uuid, text),
  public.rotate_invite(uuid), public.remove_member(uuid, uuid), public.leave_center(uuid),
  public.is_member(uuid), public.is_owner(uuid), public.new_invite_code() from public, anon;
grant execute on function public.my_centers(), public.create_center(text, text, boolean), public.join_center(text, text),
  public.center_people(uuid), public.center_recent(uuid, text, int), public.set_my_name(uuid, text),
  public.rotate_invite(uuid), public.remove_member(uuid, uuid), public.leave_center(uuid),
  public.is_member(uuid), public.is_owner(uuid) to authenticated;
