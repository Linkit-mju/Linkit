alter table organization_terms add column chart_name varchar(100);
update organization_terms set chart_name = '학생회' where chart_name is null;
alter table organization_terms alter column chart_name set not null;
