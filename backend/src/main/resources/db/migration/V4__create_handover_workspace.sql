create table handover_categories (
    id uuid primary key,
    owner_id uuid not null references users(id) on delete cascade,
    name varchar(255) not null,
    created_at timestamp with time zone not null,
    constraint ck_handover_categories_name_not_blank check (char_length(trim(name)) > 0)
);

create index ix_handover_categories_owner_created on handover_categories(owner_id, created_at, id);

create table handovers (
    id uuid primary key,
    owner_id uuid not null references users(id) on delete cascade,
    category_id uuid not null references handover_categories(id) on delete cascade,
    title varchar(255) not null,
    owner varchar(255) not null,
    status varchar(20) not null,
    summary text not null,
    critical_notes text not null,
    recurring_tasks text not null,
    checklist text not null,
    references_text text not null,
    open_questions text not null,
    updated_at timestamp with time zone not null,
    constraint ck_handovers_title_not_blank check (char_length(trim(title)) > 0),
    constraint ck_handovers_status check (status in ('draft', 'review', 'complete'))
);

create index ix_handovers_owner_updated on handovers(owner_id, updated_at desc, id asc);
