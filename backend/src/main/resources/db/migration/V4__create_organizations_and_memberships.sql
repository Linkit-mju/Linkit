create table organizations (
    id uuid primary key,
    name varchar(150) not null,
    invite_code varchar(6) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    constraint uk_organizations_invite_code unique (invite_code),
    constraint ck_organizations_invite_code_length
        check (char_length(invite_code) = 6)
);

create table memberships (
    id uuid primary key,
    user_id uuid not null,
    organization_id uuid not null,
    joined_at timestamp with time zone not null,
    constraint fk_memberships_user
        foreign key (user_id) references users (id),
    constraint fk_memberships_organization
        foreign key (organization_id) references organizations (id),
    constraint uk_memberships_user_organization
        unique (user_id, organization_id)
);

insert into organizations (id, name, invite_code, created_at, updated_at)
values (
    '10000000-0000-0000-0000-000000000001',
    '명지대학교 총학생회',
    'LINK01',
    current_timestamp,
    current_timestamp
);
