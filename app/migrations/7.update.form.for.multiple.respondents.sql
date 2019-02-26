DO
$do$
BEGIN
     UPDATE forms
     SET data = REPLACE(data, 'selectedRespondent', 'selectedContact')
     WHERE 1=1;
END
$do$
;
