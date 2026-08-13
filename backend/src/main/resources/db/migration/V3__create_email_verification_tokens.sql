alter table users
    add column email_verified_at timestamp with time zone;

create table email_verification_tokens (
    id uuid primary key,
    user_id uuid not null,
    token_hash varchar(64) not null,
    expires_at timestamp with time zone not null,
    created_at timestamp with time zone not null,
    constraint fk_email_verification_tokens_user
        foreign key (user_id) references users (id) on delete cascade,
    constraint uk_email_verification_tokens_user unique (user_id),
    constraint uk_email_verification_tokens_hash unique (token_hash)
);
