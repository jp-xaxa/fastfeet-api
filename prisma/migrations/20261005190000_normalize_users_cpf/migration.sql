-- Normaliza os CPFs já cadastrados para conter apenas dígitos
UPDATE "users" SET "cpf" = regexp_replace("cpf", '\D', '', 'g') WHERE "cpf" ~ '\D';
