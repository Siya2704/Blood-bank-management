-- drop table blood,donor1, donor2, staff, checker, receptionist, administrator,blood_bank,orders,hospital1,hospital2;
select * from receptionist;
create table staff (
	emp_id int,
    name varchar(100) not null,
    phone_no varchar(10) not null,
    email varchar(50) default null,
    role varchar(20),
    primary key (emp_id)
);

 create table receptionist(
	emp_id int,
    primary key (emp_id),
    foreign key(emp_id) references staff (emp_id)
 );
 
  create table checker(
	emp_id int,
    primary key (emp_id),
    foreign key(emp_id) references staff (emp_id)
 );
 
  create table administrator(
	emp_id int,
    primary key (emp_id),
    foreign key(emp_id) references staff (emp_id)
 );
 
create table donor1(
	donor_id char(16),
    donor_name varchar(100) not null,
    gender char(1),
    dob date not null,
    phone_no varchar(10) not null,
    email varchar(50) default null,
    address varchar(100) not null,
    primary key (donor_id)
);

create table donor2(
	donor_id char(16),
    c_date date,
    emp_id int,
    is_done boolean, 
    primary key (donor_id, c_date),
    foreign key(emp_id) references receptionist (emp_id),
    foreign key(donor_id) references donor1(donor_id)
);

create table blood (
	donor_id char(16),
    c_date date,
    blood_group char(3),
    iron_content float(3,1),
    quantity int,
	emp_id int,
    is_good boolean,
    primary key (donor_id, c_date),
    foreign key(donor_id,c_date) references donor2(donor_id, c_date) on delete cascade,
    foreign key(emp_id) references checker (emp_id)
);

create table blood_bank(
	blood_group varchar(3),
    quantity int,
    emp_id int,
    primary key(blood_group),
    foreign key(emp_id) references administrator (emp_id)
);

create table hospital1(
	id varchar(10),
    name varchar(100) not null,
    address varchar(100) not null,
    email varchar(50) default null,
    phone_no varchar(10) not null,
    primary key(id)
);

create table hospital2(
	id varchar(10),
    blood_group char(3),
    quantity int,
    date_of_request date,
    is_received boolean,
    primary key(id, blood_group),
	foreign key(id) references hospital1 (id)
);

create table orders (
	blood_group char(3),
	id varchar(10),
    primary key(id, blood_group),
    foreign key (id) references hospital2(id) on delete cascade,
    foreign key (blood_group) references blood_bank(blood_group)
);


insert into staff values ('1', 'neha', '9834567234','neha@gmail.com','receptionist');
insert into receptionist values ('1');
insert into staff values ('2', 'vijaya', '7534567225','vijaya@gmail.com','receptionist');
insert into receptionist values ('2');

insert into staff values ('3', 'tanmayee', '8983472534','tanu@gmail.com','checker');
insert into checker values ('3');
insert into staff values ('4', 'asha', '9372545612','asha@gmail.com','checker');
insert into checker values ('4');

insert into staff values ('5', 'siya', '7883472545','siya27@gmail.com','administrator');
insert into administrator values ('5');

insert into blood_bank values ('A+',0,5);
insert into blood_bank values ('B+',0,5);
insert into blood_bank values ('AB+',0,5);
insert into blood_bank values ('O+',0,5);
insert into blood_bank values ('A-',0,5);
insert into blood_bank values ('B-',0,5);
insert into blood_bank values ('AB-',0,5);
insert into blood_bank values ('O-',0,5);
