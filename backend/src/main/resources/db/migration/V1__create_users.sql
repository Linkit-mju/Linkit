create table users (
    id uuid primary key,
    email varchar(255) not null,
    name varchar(100) not null,
    password_hash varchar(255) not null,
    status varchar(40) not null,
    terms_accepted_at timestamp with time zone not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    constraint uk_users_email unique (email)
);
