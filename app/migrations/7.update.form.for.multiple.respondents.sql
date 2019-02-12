DO
$do$
BEGIN
     UPDATE forms
     SET data = REPLACE(data, 'selectedRespondent', 'selectedContact');
END
$do$
;