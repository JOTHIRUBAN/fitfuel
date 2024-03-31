--created user table

CREATE TABLE "user" (
    user_id bigserial PRIMARY KEY,
    user_name varchar NOT NULL,
	mobile bigint not null,
    email varchar NOT NULL UNIQUE,
    password varchar
);

Alter table user add column mobile bigint notnull;

ALTER SEQUENCE "user_user_id_seq" RESTART WITH 1000;

--creating user_profile

CREATE TABLE user_profile (
    user_id bigint REFERENCES "user"(user_id),
	user_name varchar NOT NULL,
    weight float NOT NULL,
    height float NOT NULL,
    health_issues varchar,
    bmi float,
    status varchar,
    diet varchar,
	required_weight float
);

--creating trigger

CREATE OR REPLACE FUNCTION fun_bmi()
RETURNS TRIGGER AS
$$
DECLARE
    height float;
    weight float;
    bmi float = 0;
    status varchar;
    required_weight float = 0;
BEGIN
    SELECT NEW.height, NEW.weight INTO height, weight;
    IF height != 0 THEN
        bmi = weight / (height * height / 10000);
    END IF;
    NEW.bmi = bmi;

    IF bmi < 18.5 THEN
        status = 'Underweight';
        required_weight = (18.5 - bmi) * (height * height / 10000);
    ELSIF bmi >= 18.5 AND bmi < 25 THEN
        status = 'Normal';
        required_weight = 0;
    ELSE
        status = 'Overweight';
        required_weight = (bmi - 25) * (height * height / 10000);
    END IF;

    NEW.status = status;
    NEW.required_weight = required_weight;

    RETURN NEW;
END
$$
LANGUAGE plpgsql;


CREATE TRIGGER trig_calculate_bmi
BEFORE INSERT OR UPDATE
ON user_profile
FOR EACH ROW
EXECUTE FUNCTION fun_bmi();


insert into "user" (user_name,mobile,email,password) values ('Jeyanth',6380905581,'jeyabalan764@gmail.com',1234);
insert into "user" (user_name,mobile,email,password) values ('arun',6333012345,'arun@gmail.com',12345);
insert into user_profile (user_id,user_name,weight,height,health_issues,diet) values(1004,'arun',86,178,'no','no');

select * from "user_profile";
delete from "user";
delete from "user_profile";
