create table rules (
    id varchar(50) not null,
    solution_id varchar(50) not null ,
    front_side bool not null,
    left_side bool not null,
    right_side bool not null,
    actions varchar(100) not null,
    createdAt bigint not null,
    updatedAt bigint not null,
    version bigint not null,
    primary key (id),
    FOREIGN KEY (solution_id) REFERENCES solutions(id)
) engine=innodb;

create table solutions (
    id varchar(50) not null,
    name varchar(50) not null unique,
    createdAt bigint not null,
    updatedAt bigint not null,
    version bigint not null,
    primary key (id)
) engine=innodb;

create table blocklys (
    id varchar(50) not null,
    name varchar(50) not null unique,
    code text not null,
    createdAt bigint not null,
    updatedAt bigint not null,
    version bigint not null,
    primary key (id)
) engine=innodb;



