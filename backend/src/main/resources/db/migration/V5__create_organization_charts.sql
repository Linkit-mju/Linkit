alter table memberships add column phone varchar(30);
alter table memberships add column profile_image_url varchar(1000);
alter table memberships add column contact_visible boolean not null default true;

create table organization_terms (
    id uuid primary key,
    organization_id uuid not null references organizations(id),
    name varchar(100) not null,
    starts_at date not null,
    ends_at date not null,
    management_active boolean not null default false,
    management_granted_at timestamp with time zone,
    created_at timestamp with time zone not null,
    constraint uk_organization_terms_name unique (organization_id, name),
    constraint ck_organization_terms_dates check (ends_at >= starts_at)
);

create table organization_departments (
    id uuid primary key,
    term_id uuid not null references organization_terms(id) on delete cascade,
    name varchar(100) not null,
    sort_order integer not null,
    archived boolean not null default false,
    constraint uk_organization_departments_name unique (term_id, name)
);

create table organization_chart_assignments (
    id uuid primary key,
    term_id uuid not null references organization_terms(id) on delete cascade,
    department_id uuid references organization_departments(id),
    membership_id uuid not null references memberships(id) on delete cascade,
    position varchar(30) not null,
    sort_order integer not null,
    created_at timestamp with time zone not null,
    constraint uk_chart_assignment_member unique (term_id, membership_id),
    constraint ck_chart_assignment_position check (position in ('PRESIDENT','VICE_PRESIDENT','DIRECTOR','MEMBER'))
);

create index ix_terms_organization on organization_terms(organization_id, starts_at desc);
create index ix_departments_term on organization_departments(term_id, sort_order);
create index ix_assignments_term on organization_chart_assignments(term_id, position, sort_order);
